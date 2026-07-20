import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
});

export const updateQuizSettingsSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  timeLimit: z.coerce.number().int().min(1).max(360).optional().nullable(),
  passingScore: z.coerce.number().int().min(0).max(100),
  attempts: z.coerce.number().int().min(1).max(50),
  randomOrder: z.boolean(),
  shuffleChoices: z.boolean(),
  fullscreen: z.boolean(),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizSettingsInput = z.infer<typeof updateQuizSettingsSchema>;

export const updateQuizTitleSchema = z.object({
  title: z.string().min(1).max(200),
});

export type UpdateQuizTitleInput = z.infer<typeof updateQuizTitleSchema>;
