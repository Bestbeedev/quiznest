"use client"

import { ChartBarCategories } from "@/components/charts"
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
    <ChartBarCategories
      data={[
        { label: "Brouillon", value: draft, fill: "var(--chart-2)" },
        { label: "Publié", value: published, fill: "var(--chart-1)" },
        { label: "Archivé", value: archived, fill: "var(--chart-5)" },
      ]}
      title="Quiz par statut"
      config={{
        brouillon: { label: "Brouillon", color: "var(--chart-2)" },
        publie: { label: "Publié", color: "var(--chart-1)" },
        archive: { label: "Archivé", color: "var(--chart-5)" },
      } satisfies ChartConfig}
      totalLabel="quiz"
    />
  )
}
