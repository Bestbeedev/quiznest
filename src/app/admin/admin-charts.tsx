"use client"

import { ChartBarInteractive } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"

export function AdminCharts({
  growthTrend,
}: {
  growthTrend: { date: string; users: number; organisations: number }[]
}) {
  return (
    <ChartBarInteractive
      data={growthTrend}
      title="Croissance de la plateforme"
      description="8 dernières semaines"
      config={{
        views: { label: "Total" },
        users: { label: "Utilisateurs", color: "var(--chart-1)" },
        organisations: { label: "Organisations", color: "var(--chart-2)" },
      } satisfies ChartConfig}
    />
  )
}
