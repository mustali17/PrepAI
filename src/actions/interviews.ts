"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startInterview(trackId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const interview = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      trackId,
      status: "IN_PROGRESS",
    },
  });

  revalidatePath("/dashboard/interviews");
  return { success: true, interview };
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
  score: number,
  feedback: string,
  suggestions: string[]
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const interviewAnswer = await prisma.interviewAnswer.create({
    data: { sessionId, questionId, answer, score, feedback, suggestions },
  });

  return { success: true, answer: interviewAnswer };
}

export async function completeInterview(
  sessionId: string,
  overallScore: number,
  aiSummary: string,
  weakAreas: string[],
  strongAreas: string[]
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const interview = await prisma.interviewSession.update({
    where: { id: sessionId, userId: session.user.id },
    data: {
      status: "COMPLETED",
      overallScore,
      aiSummary,
      weakAreas,
      strongAreas,
      completedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastActiveDate: new Date() },
  });

  revalidatePath("/dashboard/interviews");
  revalidatePath("/dashboard");
  return { success: true, interview };
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
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
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
