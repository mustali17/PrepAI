"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: unknown) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/profile");
  return { success: true, user };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: session.user.id } });
  return { success: true };
}

export async function getProfile() {
  const session = await auth();
  if (!session?.user) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      experienceLevel: true,
      targetRole: true,
      skills: true,
      resumeUrl: true,
      streak: true,
      createdAt: true,
    },
  });
}
