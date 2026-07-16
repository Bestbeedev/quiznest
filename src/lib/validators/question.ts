import { z } from "zod";

export const questionTypeSchema = z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);

export const createQuestionSchema = z
  .object({
    title: z.string().min(1).max(500),
    type: questionTypeSchema,
    points: z.coerce.number().int().min(1).max(100),
    explanation: z.string().max(1000).optional().or(z.literal("")),
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
