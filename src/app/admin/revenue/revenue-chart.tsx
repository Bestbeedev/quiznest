"use client"

import { ChartLineInteractive } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"

export function RevenueChart({
  monthlyTrend,
}: {
  monthlyTrend: { date: string; revenu: number }[]
}) {
  return (
    <ChartLineInteractive
      data={monthlyTrend}
      title="Revenus mensuels"
      description="6 derniers mois (XOF)"
      config={{
        views: { label: "Total" },
        revenu: { label: "Revenus", color: "var(--chart-3)" },
      } satisfies ChartConfig}
    />
  )
}
