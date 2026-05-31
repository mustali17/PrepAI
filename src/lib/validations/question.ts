import { z } from "zod";

export const questionSchema = z.object({
  trackId: z.string().min(1, "Track is required"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  tags: z.array(z.string()).default([]),
});

export type QuestionInput = z.infer<typeof questionSchema>;
