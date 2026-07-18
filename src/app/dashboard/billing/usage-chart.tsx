"use client"

import { ChartTooltipDefault } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"

export function UsageChart({
  usage,
}: {
  usage: { metric: string; pct: number }[]
}) {
  return (
    <ChartTooltipDefault
      data={usage}
      title="Utilisation du plan"
      description="% du quota actuel utilisé"
      config={{
        pct: { label: "% utilisé", color: "var(--chart-4)" },
      } satisfies ChartConfig}
      dataKeys={["pct"]}
      categoryKey="metric"
    />
  )
}
