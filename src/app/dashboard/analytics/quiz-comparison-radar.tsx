"use client";

import { ChartRadarLabelCustom } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";
import type { QuizComparisonRow } from "@/lib/analytics";

const MAX_QUIZZES = 8;

export function QuizComparisonRadar({ rows }: { rows: QuizComparisonRow[] }) {
  const data = rows
    .filter((r) => r.averageScore !== null)
    .sort((a, b) => b.participants - a.participants)
    .slice(0, MAX_QUIZZES)
    .map((r) => ({
      quiz: r.title.length > 20 ? `${r.title.slice(0, 20)}…` : r.title,
      score: r.averageScore ?? 0,
    }));

  return (
    <ChartRadarLabelCustom
      data={data}
      title="Comparaison des quiz"
      description="Score moyen par quiz (top 8 par nombre de participants)"
      config={{ score: { label: "Score moyen", color: "var(--chart-2)" } } satisfies ChartConfig}
      dataKeys={["score"]}
      angleKey="quiz"
    />
  );
}
