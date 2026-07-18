"use client";

import { ChartAreaInteractive } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";

/** The period selector (7j / 30j) is `ChartAreaInteractive`'s existing
 * time-range picker — "Analyse par période" without any new component. */
export function ScoreEvolutionChart({ evolution }: { evolution: { date: string; score: number | null }[] }) {
  return (
    <ChartAreaInteractive
      data={evolution as { date: string; score: number }[]}
      title="Évolution du score moyen"
      description="Score moyen des tentatives terminées, par jour"
      config={{ score: { label: "Score moyen (%)", color: "var(--chart-3)" } } satisfies ChartConfig}
      dataKeys={["score"]}
      timeRanges={[
        { label: "7 jours", value: "7d" },
        { label: "30 jours", value: "30d" },
      ]}
    />
  );
}
