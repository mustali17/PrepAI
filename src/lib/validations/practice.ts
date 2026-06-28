import { z } from "zod";

export const practiceSetSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters"),
  resumeText: z.string().min(50, "Resume text must be at least 50 characters"),
});

export type PracticeSetInput = z.infer<typeof practiceSetSchema>;
