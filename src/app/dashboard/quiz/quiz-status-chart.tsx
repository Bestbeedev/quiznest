"use client"

import { ChartLollipop } from "@/components/charts"
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
    <ChartLollipop
      data={[
        { label: "Brouillon", value: draft, color: "var(--chart-2)" },
        { label: "Publié", value: published, color: "var(--chart-1)" },
        { label: "Archivé", value: archived, color: "var(--chart-5)" },
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
