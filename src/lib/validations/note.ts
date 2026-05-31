import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
});

export type NoteInput = z.infer<typeof noteSchema>;
