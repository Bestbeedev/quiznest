import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { StartAttemptInput, SubmitAttemptInput } from "@/lib/validators/participation";

/** Public lookup by access code — only ever returns quizzes that are actually
 * open to participants (published, not deleted, within its open/close window). */
export async function getPublicQuiz(accessCode: string) {
  const quiz = await prisma.quiz.findFirst({
    where: { accessCode, status: "PUBLISHED", deletedAt: null },
    include: {
      _count: { select: { questions: true } },
      organization: { select: { name: true, logo: true } },
      questions: {
        select: { type: true },
      },
    },
  });

  if (!quiz) return null;

  const now = new Date();
  if (quiz.openDate && now < quiz.openDate) return null;
  if (quiz.closeDate && now > quiz.closeDate) return null;

  return quiz;
}

/** Questions + choices for the play screen — never includes `isCorrect`, so the
 * client has no way to see or infer the correct answer before submitting. */
export async function getQuizForPlay(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      title: true,
      timeLimit: true,
      fullscreen: true,
      passingScore: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          type: true,
          points: true,
          hint: true,
          timeLimit: true,
          choices: { orderBy: { order: "asc" }, select: { id: true, text: true } },
        },
      },
    },
  });

  if (!quiz) throw new NotFoundError("Quiz not found");
  return quiz;
}

export async function startAttempt(
  quiz: { id: string; attempts: number },
  input: StartAttemptInput,
  meta: { ipAddress?: string | null; userAgent?: string | null },
) {
  let attempt = 1;

  if (input.email) {
    const completedCount = await prisma.participant.count({
      where: { quizId: quiz.id, email: input.email, status: "COMPLETED" },
    });

    if (completedCount >= quiz.attempts) {
      throw new ValidationError("Nombre de tentatives maximum atteint pour cet email.");
    }

    attempt = completedCount + 1;
  }

  return prisma.participant.create({
    data: {
      quizId: quiz.id,
      name: input.name,
      email: input.email || null,
      attempt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });
}

async function requireOwnParticipant(participantId: string, quizId: string) {
  const participant = await prisma.participant.findFirst({
    where: { id: participantId, quizId },
  });
  if (!participant) {
    throw new NotFoundError("Participant not found");
  }
  return participant;
}

export async function submitAttempt(
  participantId: string,
  quizId: string,
  input: SubmitAttemptInput,
) {
  const participant = await requireOwnParticipant(participantId, quizId);

  if (participant.status !== "IN_PROGRESS") {
    throw new ValidationError("Cette tentative a déjà été soumise.");
  }

  const questions = await prisma.question.findMany({
    where: { quizId },
    include: { choices: true },
  });

  const questionById = new Map(questions.map((q) => [q.id, q]));
  const totalPossible = questions.reduce((sum, q) => sum + q.points, 0);

  let totalScore = 0;
  const answerRows = input.answers
    .filter((answer) => questionById.has(answer.questionId))
    .map((answer) => {
      const question = questionById.get(answer.questionId)!;
      const correctChoiceIds = question.choices.filter((c) => c.isCorrect).map((c) => c.id).sort();
      const selected = [...answer.choiceIds].sort();
      const isCorrect =
        correctChoiceIds.length === selected.length &&
        correctChoiceIds.every((id, i) => id === selected[i]);
      const score = isCorrect ? question.points : 0;
      totalScore += score;

      return {
        participantId,
        questionId: answer.questionId,
        choiceIds: answer.choiceIds,
        isCorrect,
        score,
        timeSpent: answer.timeSpent ?? null,
      };
    });

  const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 1000) / 10 : 0;
  const passingScoreQuiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    select: { passingScore: true },
  });
  const passed = percentage >= passingScoreQuiz.passingScore;
  const timeSpent = Math.round((Date.now() - participant.startedAt.getTime()) / 1000);

  await prisma.$transaction([
    prisma.answer.createMany({ data: answerRows }),
    prisma.participant.update({
      where: { id: participantId },
      data: {
        status: "COMPLETED",
        score: totalScore,
        percentage,
        passed,
        completedAt: new Date(),
        timeSpent,
      },
    }),
  ]);

  return { score: totalScore, percentage, passed };
}

export async function getResult(participantId: string, quizId: string) {
  const participant = await requireOwnParticipant(participantId, quizId);

  if (participant.status !== "COMPLETED") {
    throw new ValidationError("Cette tentative n'est pas encore terminée.");
  }

  const quiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    select: { title: true, passingScore: true, showCorrections: true },
  });

  const answers = quiz.showCorrections
    ? await prisma.answer.findMany({
        where: { participantId },
        include: {
          question: {
            select: { title: true, explanation: true, points: true, choices: true },
          },
        },
      })
    : [];

  return { participant, quiz, answers };
}

export async function listParticipants(organizationId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId } });
  if (!quiz) throw new NotFoundError("Quiz not found");

  return prisma.participant.findMany({
    where: { quizId },
    orderBy: { startedAt: "desc" },
  });
}

export async function listAllOrgParticipants(organizationId: string) {
  return prisma.participant.findMany({
    where: { quiz: { organizationId, deletedAt: null } },
    orderBy: { startedAt: "desc" },
    include: { quiz: { select: { id: true, title: true } } },
  });
}

/** Bounded variant of `listAllOrgParticipants` for widgets that only need the
 * latest few attempts (e.g. the dashboard activity feed) — avoids pulling the
 * whole participant history just to show 5 rows. */
export async function getRecentOrgParticipants(organizationId: string, limit = 5) {
  return prisma.participant.findMany({
    where: { quiz: { organizationId, deletedAt: null } },
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      status: true,
      startedAt: true,
      quiz: { select: { id: true, title: true } },
    },
  });
}

export async function getOrgParticipantStats(organizationId: string) {
  const completed = await prisma.participant.findMany({
    where: { quiz: { organizationId, deletedAt: null }, status: "COMPLETED" },
    select: { passed: true },
  });

  const total = completed.length;
  const passRate = total > 0 ? Math.round((completed.filter((p) => p.passed).length / total) * 100) : null;

  return { totalParticipants: total, passRate };
}

/** Daily attempt counts across every quiz in the org, zero-filled — same
 * `generate_series` pattern as the per-quiz and platform trend queries. */
export async function getOrgParticipantsTrend(organizationId: string, days = 14) {
  const rows = await prisma.$queryRaw<{ day: Date; count: number }[]>`
    SELECT gs.day AS day, COALESCE(count(p.id), 0)::int AS count
    FROM generate_series(
      date_trunc('day', now()) - ((${days}::int - 1) * interval '1 day'),
      date_trunc('day', now()),
      interval '1 day'
    ) AS gs(day)
    LEFT JOIN participants p
      ON date_trunc('day', p.started_at) = gs.day
      AND p.quiz_id IN (SELECT id FROM quizzes WHERE organization_id = ${organizationId} AND deleted_at IS NULL)
    GROUP BY gs.day
    ORDER BY gs.day ASC
  `;

  return rows.map((row) => ({
    date: row.day.toISOString().slice(0, 10),
    participants: row.count,
  }));
}

export async function getParticipantStatusBreakdown(organizationId: string) {
  const rows = await prisma.participant.groupBy({
    by: ["status"],
    where: { quiz: { organizationId, deletedAt: null } },
    _count: { _all: true },
  });

  const counts = { IN_PROGRESS: 0, COMPLETED: 0, ABANDONED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

const SCORE_BUCKETS = [
  [0, 10], [10, 20], [20, 30], [30, 40], [40, 50],
  [50, 60], [60, 70], [70, 80], [80, 90], [90, 101],
] as const;

export async function getQuizResultsSummary(organizationId: string, quizId: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId } });
  if (!quiz) throw new NotFoundError("Quiz not found");

  // Single bounded query for every "completed" aggregate below (score average,
  // pass rate, score distribution, average time) — no repeated round trips.
  const completed = await prisma.participant.findMany({
    where: { quizId, status: "COMPLETED" },
    select: { percentage: true, passed: true, timeSpent: true },
  });

  const totalCompleted = completed.length;
  const averageScore =
    totalCompleted > 0
      ? Math.round((completed.reduce((sum, p) => sum + p.percentage, 0) / totalCompleted) * 10) / 10
      : null;
  const passRate =
    totalCompleted > 0 ? Math.round((completed.filter((p) => p.passed).length / totalCompleted) * 100) : null;

  const timedAttempts = completed.filter((p) => p.timeSpent !== null);
  const averageTimeSpent =
    timedAttempts.length > 0
      ? Math.round(timedAttempts.reduce((sum, p) => sum + (p.timeSpent ?? 0), 0) / timedAttempts.length)
      : null;

  const scoreDistribution = SCORE_BUCKETS.map(([min, max]) => ({
    bucket: max > 100 ? `${min}-100%` : `${min}-${max}%`,
    count: completed.filter((p) => p.percentage >= min && p.percentage < max).length,
  }));

  const questions = await prisma.question.findMany({
    where: { quizId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      order: true,
      difficulty: true,
      category: true,
      answers: { where: { participant: { status: "COMPLETED" } }, select: { isCorrect: true } },
    },
  });

  const questionStats = questions.map((q) => ({
    id: q.id,
    title: q.title,
    order: q.order,
    difficulty: q.difficulty,
    category: q.category,
    successRate:
      q.answers.length > 0
        ? Math.round((q.answers.filter((a) => a.isCorrect).length / q.answers.length) * 100)
        : null,
  }));

  return { totalCompleted, averageScore, passRate, averageTimeSpent, scoreDistribution, questionStats };
}

/** Daily attempt counts for this quiz over the last `days`, zero-filled via
 * `generate_series` — same pattern as the org/platform trend queries. */
export async function getQuizAttemptsTrend(organizationId: string, quizId: string, days = 14) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId } });
  if (!quiz) throw new NotFoundError("Quiz not found");

  const rows = await prisma.$queryRaw<{ day: Date; count: number }[]>`
    SELECT gs.day AS day, COALESCE(count(p.id), 0)::int AS count
    FROM generate_series(
      date_trunc('day', now()) - ((${days}::int - 1) * interval '1 day'),
      date_trunc('day', now()),
      interval '1 day'
    ) AS gs(day)
    LEFT JOIN participants p
      ON date_trunc('day', p.started_at) = gs.day
      AND p.quiz_id = ${quizId}
    GROUP BY gs.day
    ORDER BY gs.day ASC
  `;

  return rows.map((row) => ({
    date: row.day.toISOString().slice(0, 10),
    tentatives: row.count,
  }));
}

/** Per-question answer breakdown for a single participant — fetched on demand
 * (only when the organizer opens the detail dialog for that one row), not
 * eagerly joined onto every row of the participants table. */
export async function getParticipantAnswers(organizationId: string, quizId: string, participantId: string) {
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, organizationId } });
  if (!quiz) throw new NotFoundError("Quiz not found");

  const participant = await prisma.participant.findFirst({ where: { id: participantId, quizId } });
  if (!participant) throw new NotFoundError("Participant not found");

  const [answers, history] = await Promise.all([
    prisma.answer.findMany({
      where: { participantId },
      include: {
        question: {
          select: { title: true, explanation: true, order: true, choices: true },
        },
      },
      orderBy: { question: { order: "asc" } },
    }),
    // Other attempts by the same person on this quiz — only meaningful when an
    // email was captured (anonymous participants can't be linked across attempts).
    participant.email
      ? prisma.participant.findMany({
          where: { quizId, email: participant.email, id: { not: participantId } },
          orderBy: { startedAt: "desc" },
          select: {
            id: true,
            attempt: true,
            status: true,
            percentage: true,
            passed: true,
            startedAt: true,
            completedAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return { participant, answers, history };
}
