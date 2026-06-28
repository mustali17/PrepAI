"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateInterviewBatch } from "@/actions/ai";
import { revalidatePath } from "next/cache";

export async function startInterview(source: { trackId?: string; practiceSetId?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  if (!source.trackId && !source.practiceSetId) {
    return { error: "A track or practice set is required" };
  }

  const interview = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      trackId: source.trackId,
      practiceSetId: source.practiceSetId,
      status: "IN_PROGRESS",
    },
  });

  revalidatePath("/dashboard/interviews");
  return { success: true, interview };
}

/**
 * Saves a candidate's raw answer text only — no AI call here. All answers
 * for a session are evaluated together, in one batch, when the interview
 * is completed (see completeInterview below).
 */
export async function saveAnswer(
  sessionId: string,
  question: { questionId?: string; practiceQuestionId?: string },
  answer: string
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const owns = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    select: { id: true },
  });
  if (!owns) return { error: "Session not found" };

  const interviewAnswer = await prisma.interviewAnswer.create({
    data: {
      sessionId,
      questionId: question.questionId,
      practiceQuestionId: question.practiceQuestionId,
      answer,
    },
  });

  return { success: true, answer: interviewAnswer };
}

/**
 * Fetches every saved answer for a session and evaluates the whole
 * interview in a single AI call, then writes the per-answer scores and
 * the session-level summary back in one pass. Safe to call again if a
 * prior attempt failed (e.g. AI timeout) — used for the "Try Again" retry.
 */
export async function completeInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const interview = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      answers: {
        include: { question: true, practiceQuestion: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!interview) return { error: "Session not found" };
  if (interview.answers.length === 0) return { error: "No answers to evaluate" };

  const answerPayload = interview.answers.map((a) => {
    const q = a.question ?? a.practiceQuestion;
    return {
      question: q?.question ?? "",
      answer: a.answer,
      category: q?.category ?? "General",
    };
  });

  let evaluation;
  try {
    evaluation = await evaluateInterviewBatch(answerPayload);
  } catch {
    return { error: "AI evaluation failed. Your answers are saved — you can try again." };
  }

  await prisma.$transaction([
    ...interview.answers.map((a, i) =>
      prisma.interviewAnswer.update({
        where: { id: a.id },
        data: {
          score: evaluation.evaluations[i].score,
          feedback: evaluation.evaluations[i].feedback,
          suggestions: evaluation.evaluations[i].suggestions,
        },
      })
    ),
    prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        overallScore: evaluation.overallScore,
        aiSummary: evaluation.summary,
        weakAreas: evaluation.weakAreas,
        strongAreas: evaluation.strongAreas,
        completedAt: new Date(),
      },
    }),
  ]);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastActiveDate: new Date() },
  });

  revalidatePath("/dashboard/interviews");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  return { success: true };
}

export async function abandonInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.interviewSession.update({
    where: { id: sessionId, userId: session.user.id },
    data: { status: "ABANDONED" },
  });

  revalidatePath("/dashboard/interviews");
  return { success: true };
}

export async function deleteInterview(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.interviewSession.deleteMany({
    where: { id: sessionId, userId: session.user.id },
  });

  revalidatePath("/dashboard/interviews");
  return { success: true };
}

export async function getUserInterviews() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.interviewSession.findMany({
    where: { userId: session.user.id },
    include: {
      track: { select: { title: true, icon: true } },
      practiceSet: { select: { title: true } },
      _count: { select: { answers: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function getInterviewSession(sessionId: string) {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: {
      track: true,
      practiceSet: true,
      answers: {
        include: { question: true, practiceQuestion: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/** Returns the full question list for a session's source (track or practice set), in a unified shape. */
export async function getSessionQuestions(sessionId: string) {
  const session = await auth();
  if (!session?.user) return [];

  const interview = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    select: { trackId: true, practiceSetId: true },
  });
  if (!interview) return [];

  if (interview.trackId) {
    return prisma.question.findMany({
      where: { trackId: interview.trackId },
      orderBy: { createdAt: "asc" },
    });
  }

  if (interview.practiceSetId) {
    return prisma.practiceQuestion.findMany({
      where: { practiceSetId: interview.practiceSetId },
      orderBy: { createdAt: "asc" },
    });
  }

  return [];
}

export async function getUserAnalytics() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const [totalSessions, completedSessions, answers] = await Promise.all([
    prisma.interviewSession.count({ where: { userId } }),
    prisma.interviewSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { overallScore: true, startedAt: true, weakAreas: true, strongAreas: true },
      orderBy: { startedAt: "asc" },
    }),
    prisma.interviewAnswer.findMany({
      where: { session: { userId } },
      select: { score: true },
    }),
  ]);

  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.overallScore ?? 0), 0) /
        completedSessions.length
      : 0;

  const allWeak = completedSessions.flatMap((s) => s.weakAreas);
  const allStrong = completedSessions.flatMap((s) => s.strongAreas);

  const weakFreq = allWeak.reduce<Record<string, number>>((acc, w) => {
    acc[w] = (acc[w] ?? 0) + 1;
    return acc;
  }, {});

  const strongFreq = allStrong.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const topWeak = Object.entries(weakFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area]) => area);

  const topStrong = Object.entries(strongFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([area]) => area);

  const scoreHistory = completedSessions.map((s) => ({
    date: s.startedAt.toISOString().split("T")[0],
    score: s.overallScore ?? 0,
  }));

  return {
    totalSessions,
    completedCount: completedSessions.length,
    avgScore: Math.round(avgScore * 10) / 10,
    topWeak,
    topStrong,
    scoreHistory,
    totalAnswers: answers.length,
  };
}
