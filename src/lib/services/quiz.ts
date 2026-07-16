import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";
import { slugify } from "@/lib/utils/slug";
import type { CreateQuizInput, UpdateQuizSettingsInput } from "@/lib/validators/quiz";

function generateAccessCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function uniqueQuizSlug(organizationId: string, title: string): Promise<string> {
  const base = slugify(title) || "quiz";
  let slug = base;
  let attempt = 1;

  while (await prisma.quiz.findUnique({ where: { organizationId_slug: { organizationId, slug } } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return slug;
}

export async function createQuiz(organizationId: string, authorId: string, input: CreateQuizInput) {
  const slug = await uniqueQuizSlug(organizationId, input.title);

  return prisma.quiz.create({
    data: {
      organizationId,
      authorId,
      title: input.title,
      slug,
      accessCode: generateAccessCode(),
    },
  });
}

export async function listQuizzes(organizationId: string) {
  return prisma.quiz.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });
}

export async function getQuizStats(organizationId: string) {
  const [total, published, questionCount] = await Promise.all([
    prisma.quiz.count({ where: { organizationId, deletedAt: null } }),
    prisma.quiz.count({ where: { organizationId, deletedAt: null, status: "PUBLISHED" } }),
    prisma.question.count({ where: { quiz: { organizationId, deletedAt: null } } }),
  ]);

  return { total, published, questionCount };
}

export async function getRecentQuizzes(organizationId: string, limit = 5) {
  return prisma.quiz.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { _count: { select: { questions: true } } },
  });
}

async function requireOwnedQuiz(organizationId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId, deletedAt: null } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }
  return quiz;
}

export async function getQuiz(organizationId: string, quizId: string) {
  return prisma.quiz.findFirst({
    where: { id: quizId, organizationId, deletedAt: null },
    include: { questions: { orderBy: { order: "asc" }, include: { choices: { orderBy: { order: "asc" } } } } },
  });
}

export async function updateQuizSettings(
  organizationId: string,
  quizId: string,
  input: UpdateQuizSettingsInput,
) {
  await requireOwnedQuiz(organizationId, quizId);

  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      title: input.title,
      description: input.description || null,
      timeLimit: input.timeLimit ?? null,
      passingScore: input.passingScore,
      attempts: input.attempts,
      randomOrder: input.randomOrder,
      shuffleChoices: input.shuffleChoices,
      fullscreen: input.fullscreen,
    },
  });
}

export async function publishQuiz(organizationId: string, quizId: string) {
  await requireOwnedQuiz(organizationId, quizId);
  return prisma.quiz.update({
    where: { id: quizId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
}

export async function archiveQuiz(organizationId: string, quizId: string) {
  await requireOwnedQuiz(organizationId, quizId);
  return prisma.quiz.update({
    where: { id: quizId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });
}

export async function duplicateQuiz(organizationId: string, quizId: string) {
  const quiz = await requireOwnedQuiz(organizationId, quizId);
  const slug = await uniqueQuizSlug(organizationId, `${quiz.title} copie`);

  return prisma.quiz.create({
    data: {
      organizationId,
      authorId: quiz.authorId,
      title: `${quiz.title} (copie)`,
      slug,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      attempts: quiz.attempts,
      randomOrder: quiz.randomOrder,
      shuffleChoices: quiz.shuffleChoices,
      fullscreen: quiz.fullscreen,
      accessCode: generateAccessCode(),
    },
  });
}

export async function deleteQuiz(organizationId: string, quizId: string) {
  await requireOwnedQuiz(organizationId, quizId);
  return prisma.quiz.update({ where: { id: quizId }, data: { deletedAt: new Date() } });
}
