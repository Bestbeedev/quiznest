import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";
import { slugify } from "@/lib/utils/slug";
import type { CreateQuizInput, UpdateQuizSettingsInput } from "@/lib/validators/quiz";

function generateAccessCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** accessCode is globally unique (it's the public quiz-taking URL segment), unlike
 * slug which only needs to be unique within an organization. */
async function uniqueAccessCode(): Promise<string> {
  let code = generateAccessCode();
  while (await prisma.quiz.findUnique({ where: { accessCode: code } })) {
    code = generateAccessCode();
  }
  return code;
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
  const [slug, accessCode] = await Promise.all([
    uniqueQuizSlug(organizationId, input.title),
    uniqueAccessCode(),
  ]);

  return prisma.quiz.create({
    data: {
      organizationId,
      authorId,
      title: input.title,
      slug,
      accessCode,
    },
  });
}

export async function listQuizzes(organizationId: string) {
  return prisma.quiz.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
      author: { select: { id: true, name: true } },
    },
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

/** Weekly quiz-creation counts, zero-filled for weeks with no activity —
 * `generate_series` does the week alignment so JS never has to reproduce
 * Postgres's `date_trunc('week', ...)` boundary math. */
export async function getQuizCreationTrend(organizationId: string, weeks = 8) {
  const rows = await prisma.$queryRaw<{ week: Date; count: number }[]>`
    SELECT gs.week AS week, COALESCE(count(q.id), 0)::int AS count
    FROM generate_series(
      date_trunc('week', now()) - ((${weeks}::int - 1) * interval '7 day'),
      date_trunc('week', now()),
      interval '7 day'
    ) AS gs(week)
    LEFT JOIN quizzes q
      ON date_trunc('week', q.created_at) = gs.week
      AND q.organization_id = ${organizationId}
      AND q.deleted_at IS NULL
    GROUP BY gs.week
    ORDER BY gs.week ASC
  `;

  return rows.map((row) => ({
    date: row.week.toISOString().slice(0, 10),
    quiz: row.count,
  }));
}

export async function getRecentQuizzes(organizationId: string, limit = 5) {
  return prisma.quiz.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { _count: { select: { questions: true } } },
  });
}

export async function searchQuizzes(organizationId: string, query: string, limit = 5) {
  return prisma.quiz.findMany({
    where: { organizationId, deletedAt: null, title: { contains: query, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, status: true },
  });
}

export async function getQuizStatusBreakdown(organizationId: string) {
  const rows = await prisma.quiz.groupBy({
    by: ["status"],
    where: { organizationId, deletedAt: null },
    _count: { _all: true },
  });

  const counts = { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

/** Ranks quizzes by their participant count — used for the dashboard's "top
 * quizzes" panel. Excludes quizzes with zero participants since a 0-length
 * bar carries no information. */
export async function getTopQuizzesByParticipation(organizationId: string, limit = 5) {
  const quizzes = await prisma.quiz.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { participants: { _count: "desc" } },
    take: limit,
    select: { id: true, title: true, _count: { select: { participants: true } } },
  });

  return quizzes
    .filter((quiz) => quiz._count.participants > 0)
    .map((quiz) => ({ id: quiz.id, title: quiz.title, participants: quiz._count.participants }));
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
  const [slug, accessCode] = await Promise.all([
    uniqueQuizSlug(organizationId, `${quiz.title} copie`),
    uniqueAccessCode(),
  ]);

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
      accessCode,
    },
  });
}

export async function deleteQuiz(organizationId: string, quizId: string) {
  await requireOwnedQuiz(organizationId, quizId);
  return prisma.quiz.update({ where: { id: quizId }, data: { deletedAt: new Date() } });
}

/** Bulk transitions use a single `updateMany` instead of N individual updates —
 * only quizzes actually eligible for the transition (right status, right org,
 * not deleted) are touched, mirroring the single-row action's guard. */
export async function bulkPublishQuizzes(organizationId: string, quizIds: string[]) {
  const eligible = await prisma.quiz.findMany({
    where: { id: { in: quizIds }, organizationId, deletedAt: null, status: "DRAFT" },
    select: { id: true },
  });
  const ids = eligible.map((q) => q.id);
  if (ids.length > 0) {
    await prisma.quiz.updateMany({
      where: { id: { in: ids } },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
  return ids;
}

export async function bulkArchiveQuizzes(organizationId: string, quizIds: string[]) {
  const eligible = await prisma.quiz.findMany({
    where: { id: { in: quizIds }, organizationId, deletedAt: null, status: "PUBLISHED" },
    select: { id: true },
  });
  const ids = eligible.map((q) => q.id);
  if (ids.length > 0) {
    await prisma.quiz.updateMany({
      where: { id: { in: ids } },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });
  }
  return ids;
}

export async function bulkDeleteQuizzes(organizationId: string, quizIds: string[]) {
  const eligible = await prisma.quiz.findMany({
    where: { id: { in: quizIds }, organizationId, deletedAt: null },
    select: { id: true },
  });
  const ids = eligible.map((q) => q.id);
  if (ids.length > 0) {
    await prisma.quiz.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  }
  return ids;
}

/** Duplication creates a new row per quiz, so unlike the other bulk ops it can't
 * collapse to one `updateMany` — `allSettled` at least runs them concurrently
 * and lets valid duplications succeed even if one quiz id is stale. */
export async function bulkDuplicateQuizzes(organizationId: string, quizIds: string[]) {
  const results = await Promise.allSettled(quizIds.map((id) => duplicateQuiz(organizationId, id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof duplicateQuiz>>> => r.status === "fulfilled")
    .map((r) => r.value);
}
