"use client"

import { ChartPieLegend } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"

export function QuizStatusChart({
  draft,
  published,
  archived,
}: {
  draft: number
  published: number
  archived: number
}) {
  return (
    <ChartPieLegend
      data={[
        { statut: "brouillon", visitors: draft, fill: "var(--color-brouillon)" },
        { statut: "publie", visitors: published, fill: "var(--color-publie)" },
        { statut: "archive", visitors: archived, fill: "var(--color-archive)" },
      ]}
      title="Quiz par statut"
      config={{
        visitors: { label: "Quiz" },
        brouillon: { label: "Brouillon", color: "var(--chart-2)" },
        publie: { label: "Publié", color: "var(--chart-1)" },
        archive: { label: "Archivé", color: "var(--chart-5)" },
      } satisfies ChartConfig}
      dataKey="visitors"
      nameKey="statut"
    />
  )
}
