import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  experienceLevel: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD"]).optional(),
  targetRole: z.string().optional(),
  skills: z.array(z.string()).default([]),
  resumeUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
