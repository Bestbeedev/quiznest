/**
 * Pure aggregation functions for the Analytics (BI) page — no Prisma here on
 * purpose. The page fetches the three datasets it needs via the existing
 * `listAllOrgParticipants` / `listAllQuestions` / `listQuizzes` service
 * functions (already used elsewhere, already indexed/bounded) and hands them
 * to these to derive every chart/table. Zero new queries.
 */

type ParticipantLike = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  percentage: number;
  passed: boolean;
  timeSpent: number | null;
  startedAt: Date;
  completedAt: Date | null;
  quiz: { id: string; title: string };
};

type QuestionLike = {
  id: string;
  title: string;
  successRate: number | null;
  averageTimeSpent: number | null;
  quiz: { id: string; title: string };
};

const SCORE_BUCKETS = [
  [0, 10], [10, 20], [20, 30], [30, 40], [40, 50],
  [50, 60], [60, 70], [70, 80], [80, 90], [90, 101],
] as const;

export function computeScoreDistribution(participants: ParticipantLike[]) {
  const completed = participants.filter((p) => p.status === "COMPLETED");
  return SCORE_BUCKETS.map(([min, max]) => ({
    bucket: max > 100 ? `${min}-100%` : `${min}-${max}%`,
    count: completed.filter((p) => p.percentage >= min && p.percentage < max).length,
  }));
}

/** Daily average score among completions, last `days` days. A day with zero
 * completions is `null` (a real gap in the line), never a fabricated 0 —
 * "average of nothing" isn't a number. */
export function computeScoreEvolution(participants: ParticipantLike[], days = 30) {
  const completed = participants.filter((p) => p.status === "COMPLETED" && p.completedAt);
  const byDay = new Map<string, number[]>();
  for (const p of completed) {
    const key = p.completedAt!.toISOString().slice(0, 10);
    const list = byDay.get(key) ?? [];
    list.push(p.percentage);
    byDay.set(key, list);
  }

  const points: { date: string; score: number | null }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const scores = byDay.get(key);
    points.push({
      date: key,
      score: scores && scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}

export type QuizComparisonRow = {
  quizId: string;
  title: string;
  participants: number;
  averageScore: number | null;
  passRate: number | null;
  averageTime: number | null;
};

export function computeQuizComparison(
  participants: ParticipantLike[],
  quizzes: { id: string; title: string }[],
): QuizComparisonRow[] {
  return quizzes.map((quiz) => {
    const rows = participants.filter((p) => p.quiz.id === quiz.id);
    const completed = rows.filter((p) => p.status === "COMPLETED");
    const timed = completed.filter((p) => p.timeSpent !== null);
    return {
      quizId: quiz.id,
      title: quiz.title,
      participants: rows.length,
      averageScore:
        completed.length > 0
          ? Math.round((completed.reduce((sum, p) => sum + p.percentage, 0) / completed.length) * 10) / 10
          : null,
      passRate:
        completed.length > 0
          ? Math.round((completed.filter((p) => p.passed).length / completed.length) * 100)
          : null,
      averageTime:
        timed.length > 0
          ? Math.round(timed.reduce((sum, p) => sum + (p.timeSpent ?? 0), 0) / timed.length)
          : null,
    };
  });
}

export type UserAnalysisRow = {
  key: string;
  name: string;
  email: string | null;
  attempts: number;
  quizzesTaken: number;
  averageScore: number | null;
  passRate: number | null;
};

/** Grouped by email when present (the only reliable identity across attempts —
 * see the same rule already applied to per-participant "historique"); each
 * anonymous (no-email) attempt is its own group, keyed by participant id, since
 * name alone isn't a safe identity to merge on. */
export function computeUserAnalysis(participants: ParticipantLike[]): UserAnalysisRow[] {
  const groups = new Map<string, ParticipantLike[]>();
  for (const p of participants) {
    const key = p.email ?? `__anon_${p.id}`;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([key, rows]) => {
    const completed = rows.filter((p) => p.status === "COMPLETED");
    return {
      key,
      name: rows[0].name,
      email: rows[0].email,
      attempts: rows.length,
      quizzesTaken: new Set(rows.map((p) => p.quiz.id)).size,
      averageScore:
        completed.length > 0
          ? Math.round((completed.reduce((sum, p) => sum + p.percentage, 0) / completed.length) * 10) / 10
          : null,
      passRate:
        completed.length > 0
          ? Math.round((completed.filter((p) => p.passed).length / completed.length) * 100)
          : null,
    };
  });
}

export function rankQuestionsByDifficulty(questions: QuestionLike[], limit = 5) {
  const withData = questions.filter((q) => q.successRate !== null);
  const sorted = [...withData].sort((a, b) => (a.successRate ?? 0) - (b.successRate ?? 0));
  return {
    hardest: sorted.slice(0, limit),
    easiest: sorted.slice(-limit).reverse(),
  };
}
