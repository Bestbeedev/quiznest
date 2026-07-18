"use client";

import { ChartTooltipDefault } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";

export function ScoreDistributionChart({ distribution }: { distribution: { bucket: string; count: number }[] }) {
  return (
    <ChartTooltipDefault
      data={distribution}
      title="Distribution des notes"
      description="Nombre de participants par tranche de score, tous quiz confondus"
      config={{ count: { label: "Participants", color: "var(--chart-1)" } } satisfies ChartConfig}
      dataKeys={["count"]}
      categoryKey="bucket"
    />
  );
}
