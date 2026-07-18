import { z } from "zod";

export const startAttemptSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email().optional().or(z.literal("")),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      choiceIds: z.array(z.string().min(1)),
      timeSpent: z.coerce.number().int().min(0).max(86400).optional(),
    }),
  ),
});

export type StartAttemptInput = z.infer<typeof startAttemptSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
