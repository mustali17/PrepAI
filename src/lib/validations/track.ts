import { z } from "zod";

export const trackSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  icon: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export type TrackInput = z.infer<typeof trackSchema>;
