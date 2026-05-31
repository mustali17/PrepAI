"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations/question";
import { revalidatePath } from "next/cache";

export async function createQuestion(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = questionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const question = await prisma.question.create({ data: parsed.data });

  revalidatePath("/admin/questions");
  return { success: true, question };
}

export async function updateQuestion(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = questionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const question = await prisma.question.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/questions");
  return { success: true, question };
}

export async function deleteQuestion(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.question.delete({ where: { id } });

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function getQuestionsByTrack(trackId: string) {
  return prisma.question.findMany({
    where: { trackId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllQuestions() {
  return prisma.question.findMany({
    include: { track: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
}
