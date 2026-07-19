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

/** Resolves a question to its owning (org-scoped) quiz — used by bank actions,
 * which only have a `questionId`, not the `quizId` a per-quiz action starts from. */
async function requireOwnedQuestion(organizationId: string, questionId: string) {
  const question = await prisma.question.findFirst({
    where: { id: questionId, quiz: { organizationId, deletedAt: null } },
    include: { choices: { orderBy: { order: "asc" } } },
  });
  if (!question) {
    throw new NotFoundError("Question not found");
  }
  return question;
}

export async function searchQuestions(organizationId: string, query: string, limit = 5) {
  return prisma.question.findMany({
    where: { quiz: { organizationId, deletedAt: null }, title: { contains: query, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, quizId: true, quiz: { select: { title: true } } },
  });
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
      difficulty: input.difficulty,
      points: input.points,
      timeLimit: input.timeLimit ?? null,
      hint: input.hint ?? null,
      explanation: input.explanation || null,
      category: input.category || null,
      tags: input.tags ?? [],
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

/** Full replace-in-place: existing choices are dropped and recreated from
 * `input`, mirroring how `addQuestion` builds them — simplest correct way to
 * keep choice `order` and ids consistent with whatever the form submitted. */
export async function updateQuestion(organizationId: string, questionId: string, input: CreateQuestionInput) {
  const question = await requireOwnedQuestion(organizationId, questionId);

  await prisma.questionChoice.deleteMany({ where: { questionId: question.id } });

  return prisma.question.update({
    where: { id: question.id },
    data: {
      title: input.title,
      type: input.type,
      difficulty: input.difficulty,
      points: input.points,
      timeLimit: input.timeLimit ?? null,
      hint: input.hint ?? null,
      explanation: input.explanation || null,
      category: input.category || null,
      tags: input.tags ?? [],
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
          difficulty: input.difficulty,
          points: input.points,
          timeLimit: input.timeLimit ?? null,
          hint: input.hint ?? null,
          explanation: input.explanation || null,
          category: input.category || null,
          tags: input.tags ?? [],
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

async function nextOrder(quizId: string) {
  const last = await prisma.question.findFirst({ where: { quizId }, orderBy: { order: "desc" } });
  return (last?.order ?? -1) + 1;
}

export async function duplicateQuestionToQuiz(organizationId: string, questionId: string, targetQuizId: string) {
  const question = await requireOwnedQuestion(organizationId, questionId);
  await requireOwnedQuiz(organizationId, targetQuizId);
  const order = await nextOrder(targetQuizId);

  return prisma.question.create({
    data: {
      quizId: targetQuizId,
      title: question.title,
      type: question.type,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      hint: question.hint,
      explanation: question.explanation,
      category: question.category,
      tags: question.tags,
      order,
      choices: {
        create: question.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect, order: c.order })),
      },
    },
  });
}

export async function moveQuestionToQuiz(organizationId: string, questionId: string, targetQuizId: string) {
  const question = await requireOwnedQuestion(organizationId, questionId);
  await requireOwnedQuiz(organizationId, targetQuizId);
  const order = await nextOrder(targetQuizId);

  return prisma.question.update({
    where: { id: question.id },
    data: { quizId: targetQuizId, order },
  });
}

/** Every id not owned by this org (already deleted, wrong tenant) is silently
 * skipped rather than failing the whole batch — best-effort bulk semantics,
 * consistent with the quiz bulk actions. */
async function ownedQuestionIds(organizationId: string, questionIds: string[]) {
  const owned = await prisma.question.findMany({
    where: { id: { in: questionIds }, quiz: { organizationId, deletedAt: null } },
    select: { id: true },
  });
  return owned.map((q) => q.id);
}

export async function bulkDeleteQuestions(organizationId: string, questionIds: string[]) {
  const ids = await ownedQuestionIds(organizationId, questionIds);
  if (ids.length > 0) {
    await prisma.question.deleteMany({ where: { id: { in: ids } } });
  }
  return ids;
}

export async function bulkMoveQuestions(organizationId: string, questionIds: string[], targetQuizId: string) {
  await requireOwnedQuiz(organizationId, targetQuizId);
  const ids = await ownedQuestionIds(organizationId, questionIds);
  let order = await nextOrder(targetQuizId);

  await prisma.$transaction(
    ids.map((id) =>
      prisma.question.update({ where: { id }, data: { quizId: targetQuizId, order: order++ } }),
    ),
  );
  return ids;
}

export async function bulkDuplicateQuestions(organizationId: string, questionIds: string[], targetQuizId: string) {
  const results = await Promise.allSettled(
    questionIds.map((id) => duplicateQuestionToQuiz(organizationId, id, targetQuizId)),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof duplicateQuestionToQuiz>>> => r.status === "fulfilled")
    .map((r) => r.value);
}

/** Cross-quiz "question bank" view for the whole org. Per-question success
 * rate / average time are computed from the same bounded `answers` include —
 * one query, no N+1 — and only the aggregates are returned (not the raw
 * per-attempt rows) so the payload stays small regardless of answer volume. */
export async function listAllQuestions(organizationId: string) {
  const questions = await prisma.question.findMany({
    where: { quiz: { organizationId, deletedAt: null } },
    orderBy: { createdAt: "desc" },
    include: {
      quiz: { select: { id: true, title: true } },
      choices: { orderBy: { order: "asc" } },
      answers: {
        where: { participant: { status: "COMPLETED" } },
        select: { isCorrect: true, timeSpent: true },
      },
    },
  });

  return questions.map(({ answers, ...question }) => {
    const timed = answers.filter((a) => a.timeSpent !== null);
    return {
      ...question,
      successRate:
        answers.length > 0
          ? Math.round((answers.filter((a) => a.isCorrect).length / answers.length) * 100)
          : null,
      averageTimeSpent:
        timed.length > 0
          ? Math.round(timed.reduce((sum, a) => sum + (a.timeSpent ?? 0), 0) / timed.length)
          : null,
      answeredCount: answers.length,
    };
  });
}
