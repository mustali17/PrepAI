"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { practiceSetSchema } from "@/lib/validations/practice";
import { generatePracticeQuestions } from "@/actions/ai";
import { extractResumeText } from "@/lib/resume/parse";
import { revalidatePath } from "next/cache";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

export async function createPracticeSet(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const jobDescription = formData.get("jobDescription") as string;
  const resumeFile = formData.get("resume") as File | null;
  const resumePastedText = (formData.get("resumeText") as string | null) ?? "";

  if (!resumeFile?.size && !resumePastedText.trim()) {
    return { error: "Upload a resume file or paste resume text" };
  }

  if (resumeFile && resumeFile.size > MAX_RESUME_SIZE) {
    return { error: "Resume file must be under 5MB" };
  }

  let resumeText = resumePastedText.trim();
  if (resumeFile?.size) {
    try {
      resumeText = await extractResumeText(resumeFile);
    } catch (err) {
      console.error("[createPracticeSet] resume parse failed:", err);
      return { error: "Could not read the uploaded resume file. Try pasting the text instead." };
    }
  }

  const parsed = practiceSetSchema.safeParse({ title, jobDescription, resumeText });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const generatedQuestions = await generatePracticeQuestions(
    parsed.data.jobDescription,
    parsed.data.resumeText
  );

  if (generatedQuestions.length === 0) {
    return { error: "AI could not generate questions from this job description and resume" };
  }

  const practiceSet = await prisma.practiceSet.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      jobDescription: parsed.data.jobDescription,
      resumeText: parsed.data.resumeText,
      questions: {
        create: generatedQuestions,
      },
    },
  });

  revalidatePath("/dashboard/practice");
  return { success: true, practiceSetId: practiceSet.id };
}

export async function getUserPracticeSets() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.practiceSet.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { questions: true, sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPracticeSet(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.practiceSet.findFirst({
    where: { id, userId: session.user.id },
    include: { questions: true },
  });
}

export async function deletePracticeSet(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.practiceSet.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath("/dashboard/practice");
  return { success: true };
}
