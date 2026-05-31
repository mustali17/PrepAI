"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackSchema } from "@/lib/validations/track";
import { revalidatePath } from "next/cache";

export async function createTrack(data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = trackSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const track = await prisma.track.create({
    data: { ...parsed.data, createdBy: session.user.id },
  });

  revalidatePath("/dashboard/tracks");
  revalidatePath("/admin/tracks");
  return { success: true, track };
}

export async function updateTrack(id: string, data: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const parsed = trackSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const track = await prisma.track.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/tracks");
  revalidatePath("/admin/tracks");
  return { success: true, track };
}

export async function deleteTrack(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.track.delete({ where: { id } });

  revalidatePath("/dashboard/tracks");
  revalidatePath("/admin/tracks");
  return { success: true };
}

export async function getTracks() {
  return prisma.track.findMany({
    where: { isPublished: true },
    include: { _count: { select: { questions: true, sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllTracksAdmin() {
  return prisma.track.findMany({
    include: { _count: { select: { questions: true, sessions: true } } },
    orderBy: { createdAt: "desc" },
  });
}
