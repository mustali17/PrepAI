import { auth } from "@/lib/auth";
import { generateInterviewQuestions } from "@/actions/ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  targetRole: z.string().min(1),
  experienceLevel: z.string().min(1),
  skills: z.array(z.string()),
  count: z.number().min(1).max(10).default(5),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { targetRole, experienceLevel, skills, count } = parsed.data;

  const questions = await generateInterviewQuestions(targetRole, experienceLevel, skills, count);

  return NextResponse.json({ questions });
}
