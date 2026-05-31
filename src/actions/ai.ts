"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { getAIModel } from "@/lib/ai/client";

const evaluationSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string(),
  suggestions: z.array(z.string()),
  technicalAccuracy: z.number().min(0).max(10),
  communication: z.number().min(0).max(10),
  completeness: z.number().min(0).max(10),
});

const questionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      tags: z.array(z.string()),
    })
  ),
});

const summarySchema = z.object({
  overallScore: z.number().min(0).max(10),
  summary: z.string(),
  weakAreas: z.array(z.string()),
  strongAreas: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export async function evaluateAnswer(question: string, answer: string, category: string) {
  const model = getAIModel();

  const { object } = await generateObject({
    model,
    schema: evaluationSchema,
    prompt: `You are a senior technical interviewer. Evaluate the following interview answer.

Question: ${question}
Category: ${category}
Candidate's Answer: ${answer}

Evaluate on:
- Technical accuracy (0-10)
- Communication clarity (0-10)
- Completeness (0-10)
- Overall score (0-10)

Provide specific, actionable feedback and 2-3 concrete improvement suggestions.`,
  });

  return object;
}

export async function generateInterviewQuestions(
  targetRole: string,
  experienceLevel: string,
  skills: string[],
  count: number = 5
) {
  const model = getAIModel();

  const { object } = await generateObject({
    model,
    schema: questionsSchema,
    prompt: `Generate ${count} technical interview questions for:
- Role: ${targetRole}
- Experience Level: ${experienceLevel}
- Key Skills: ${skills.join(", ")}

Include a mix of difficulties. Make questions specific, practical, and relevant to real-world scenarios. Include tags for each question.`,
  });

  return object.questions;
}

export async function generateInterviewSummary(
  answers: { question: string; answer: string; score: number | null }[]
) {
  const model = getAIModel();

  const answerText = answers
    .map(
      (a, i) =>
        `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score ?? "N/A"}/10`
    )
    .join("\n\n");

  const { object } = await generateObject({
    model,
    schema: summarySchema,
    prompt: `Analyze this completed technical interview and provide a comprehensive summary.

Interview Answers:
${answerText}

Identify:
1. Overall performance score (0-10)
2. Key weak areas that need improvement
3. Strong areas demonstrated
4. Specific study recommendations
5. A brief, encouraging summary paragraph`,
  });

  return object;
}

export async function analyzeWeakAreas(
  previousInterviews: { weakAreas: string[]; strongAreas: string[]; overallScore: number }[]
) {
  const model = getAIModel();

  const allWeak = previousInterviews.flatMap((i) => i.weakAreas);
  const allStrong = previousInterviews.flatMap((i) => i.strongAreas);
  const avgScore =
    previousInterviews.reduce((acc, i) => acc + i.overallScore, 0) /
    previousInterviews.length;

  const { object } = await generateObject({
    model,
    schema: z.object({
      priorityAreas: z.array(z.string()),
      studyPlan: z.array(
        z.object({
          topic: z.string(),
          reason: z.string(),
          resources: z.array(z.string()),
        })
      ),
      encouragement: z.string(),
    }),
    prompt: `Based on ${previousInterviews.length} mock interviews with avg score ${avgScore.toFixed(1)}/10:

Weak areas (recurring): ${[...new Set(allWeak)].join(", ")}
Strong areas: ${[...new Set(allStrong)].join(", ")}

Create a personalized study plan with:
1. Top 3 priority topics to focus on
2. A structured study plan for each weak area with specific resources
3. An encouraging message`,
  });

  return object;
}
