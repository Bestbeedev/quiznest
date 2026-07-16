import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";
import type { CreateQuestionInput } from "@/lib/validators/question";

async function requireOwnedQuiz(organizationId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId, deletedAt: null } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }
  return quiz;
}

export async function addQuestion(organizationId: string, quizId: string, input: CreateQuestionInput) {
  await requireOwnedQuiz(organizationId, quizId);

  const lastQuestion = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { order: "desc" },
  });

  return prisma.question.create({
    data: {
      quizId,
      title: input.title,
      type: input.type,
      points: input.points,
      explanation: input.explanation || null,
      order: (lastQuestion?.order ?? -1) + 1,
      choices: {
        create: input.choices.map((choice, index) => ({
          text: choice.text,
          isCorrect: choice.isCorrect,
          order: index,
        })),
      },
    },
  });
}

export async function importQuestions(
  organizationId: string,
  quizId: string,
  inputs: CreateQuestionInput[],
) {
  await requireOwnedQuiz(organizationId, quizId);

  const lastQuestion = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { order: "desc" },
  });
  let order = (lastQuestion?.order ?? -1) + 1;

  return prisma.$transaction(
    inputs.map((input) =>
      prisma.question.create({
        data: {
          quizId,
          title: input.title,
          type: input.type,
          points: input.points,
          explanation: input.explanation || null,
          order: order++,
          choices: {
            create: input.choices.map((choice, index) => ({
              text: choice.text,
              isCorrect: choice.isCorrect,
              order: index,
            })),
          },
        },
      }),
    ),
  );
}

export async function deleteQuestion(organizationId: string, quizId: string, questionId: string) {
  await requireOwnedQuiz(organizationId, quizId);
  return prisma.question.delete({ where: { id: questionId, quizId } });
}

export async function listAllQuestions(organizationId: string) {
  return prisma.question.findMany({
    where: { quiz: { organizationId, deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: { quiz: { select: { id: true, title: true } } },
  });
}
