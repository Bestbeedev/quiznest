import { z } from "zod";

const importTypeSchema = z.enum(["single_choice", "multiple_choice", "true_false"]);

const importQuestionSchema = z
  .object({
    type: importTypeSchema,
    question: z.string().min(1).max(500),
    points: z.coerce.number().int().min(1).max(100).default(1),
    explanation: z.string().max(1000).optional(),
    choices: z
      .array(
        z.object({
          text: z.string().min(1).max(300),
          correct: z.boolean(),
        }),
      )
      .min(2),
  })
  .refine((data) => data.choices.some((choice) => choice.correct), {
    message: "Chaque question doit avoir au moins une bonne réponse.",
  });

export const aiImportSchema = z.object({
  questions: z.array(importQuestionSchema).min(1).max(50),
});

export type AiImportInput = z.infer<typeof aiImportSchema>;

const TYPE_MAP = {
  single_choice: "SINGLE_CHOICE",
  multiple_choice: "MULTIPLE_CHOICE",
  true_false: "TRUE_FALSE",
} as const;

export function toCreateQuestionInputs(input: AiImportInput) {
  return input.questions.map((question) => ({
    title: question.question,
    type: TYPE_MAP[question.type],
    points: question.points,
    explanation: question.explanation ?? "",
    choices: question.choices.map((choice) => ({ text: choice.text, isCorrect: choice.correct })),
  }));
}
