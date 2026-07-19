import { z } from "zod";

export const questionTypeSchema = z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]);

export const questionDifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const createQuestionSchema = z
  .object({
    title: z.string().min(1).max(500),
    type: questionTypeSchema,
    difficulty: questionDifficultySchema.default("MEDIUM"),
    points: z.coerce.number().int().min(1).max(100),
    timeLimit: z.coerce.number().int().min(1).max(3600).optional().nullable(),
    hint: z.string().max(500).optional().nullable(),
    explanation: z.string().max(1000).optional().or(z.literal("")).nullable(),
    category: z.string().max(100).optional().or(z.literal("")).nullable(),
    tags: z.array(z.string().min(1).max(50)).max(10).optional().nullable(),
    choices: z
      .array(
        z.object({
          text: z.string().min(1).max(300),
          isCorrect: z.boolean(),
        }),
      )
      .min(2),
  })
  .refine((data) => data.choices.some((choice) => choice.isCorrect), {
    message: "Sélectionnez au moins une bonne réponse.",
    path: ["choices"],
  })
  .refine(
    (data) =>
      data.type !== "SINGLE_CHOICE" && data.type !== "TRUE_FALSE"
        ? true
        : data.choices.filter((choice) => choice.isCorrect).length === 1,
    {
      message: "Une seule bonne réponse est autorisée pour ce type de question.",
      path: ["choices"],
    },
  );

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
