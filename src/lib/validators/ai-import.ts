import { z } from "zod";

const importTypeSchema = z.enum([
  "single_choice",
  "multiple_choice",
  "true_false",
  "short_answer",
]);

const importDifficultySchema = z.enum(["easy", "medium", "hard"]).default("medium");

export const aiImportQuestionSchema = z
  .object({
    type: importTypeSchema,
    question: z.string().min(1).max(500),
    difficulty: importDifficultySchema,
    points: z.coerce.number().int().min(1).max(100).default(1),
    category: z.string().max(100).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    hint: z.string().max(500).optional(),
    timeLimit: z.coerce.number().int().min(1).max(3600).optional(),
    explanation: z.string().max(1000).optional(),
    choices: z
      .array(
        z.object({
          text: z.string().min(1).max(300),
          correct: z.boolean(),
        }),
      )
      .min(2)
      .optional(),
    acceptedAnswers: z.array(z.string().min(1).max(300)).min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "short_answer") {
        return !data.choices || data.choices.length === 0;
      }
      return data.choices && data.choices.length >= 2;
    },
    {
      message:
        "Les questions à choix doivent avoir au moins 2 choix. Les questions 'short_answer' ne doivent pas avoir de choix.",
    },
  )
  .refine(
    (data) => {
      if (data.type === "short_answer") {
        return data.acceptedAnswers && data.acceptedAnswers.length > 0;
      }
      return data.choices && data.choices.some((c) => c.correct);
    },
    {
      message:
        "Les questions 'short_answer' doivent avoir au moins une réponse acceptée. Les questions à choix doivent avoir au moins une bonne réponse.",
    },
  );

export const aiImportSchema = z.object({
  questions: z.array(aiImportQuestionSchema).min(1).max(50),
});

export type AiImportInput = z.infer<typeof aiImportSchema>;
export type AiImportQuestion = z.infer<typeof aiImportQuestionSchema>;

const TYPE_MAP = {
  single_choice: "SINGLE_CHOICE",
  multiple_choice: "MULTIPLE_CHOICE",
  true_false: "TRUE_FALSE",
  short_answer: "SHORT_ANSWER",
} as const;

const DIFFICULTY_MAP = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
} as const;

export function toCreateQuestionInput(question: AiImportQuestion) {
  const choices =
    question.type === "short_answer"
      ? (question.acceptedAnswers ?? []).map((text) => ({ text, isCorrect: true }))
      : (question.choices ?? []).map((choice) => ({ text: choice.text, isCorrect: choice.correct }));

  return {
    title: question.question,
    type: TYPE_MAP[question.type],
    difficulty: DIFFICULTY_MAP[question.difficulty],
    points: question.points,
    category: question.category ?? null,
    tags: question.tags ?? [],
    hint: question.hint ?? null,
    timeLimit: question.timeLimit ?? null,
    explanation: question.explanation ?? "",
    choices,
  };
}

export function toCreateQuestionInputs(input: AiImportInput) {
  return input.questions.map(toCreateQuestionInput);
}
