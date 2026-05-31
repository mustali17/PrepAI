"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validations/note";
import { revalidatePath } from "next/cache";

export async function createNote(data: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = noteSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const note = await prisma.note.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  revalidatePath("/dashboard/notes");
  return { success: true, note };
}

export async function updateNote(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return { error: "Note not found" };

  const parsed = noteSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const updated = await prisma.note.update({ where: { id }, data: parsed.data });

  revalidatePath("/dashboard/notes");
  return { success: true, note: updated };
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.note.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath("/dashboard/notes");
  return { success: true };
}

export async function getUserNotes(search?: string) {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.note.findMany({
    where: {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
}

export async function togglePinNote(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return { error: "Note not found" };

  await prisma.note.update({ where: { id }, data: { isPinned: !note.isPinned } });

  revalidatePath("/dashboard/notes");
  return { success: true };
}
