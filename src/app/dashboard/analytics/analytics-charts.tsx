"use client"

import { ChartRadialStacked, ChartTooltipDefault } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"

export function AnalyticsCharts({
  totalParticipants,
  passRate,
  totalQuizzes,
  publishedQuizzes,
}: {
  totalParticipants: number
  passRate: number | null
  totalQuizzes: number
  publishedQuizzes: number
}) {
  const passed = passRate ?? 0
  const failed = passRate !== null ? 100 - passRate : 0
  const draftQuizzes = totalQuizzes - publishedQuizzes

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartRadialStacked
        data={[{ reussi: passed, nonReussi: failed }]}
        title="Taux de réussite"
        description={`Basé sur ${totalParticipants} participants`}
        config={{
          reussi: { label: "Réussi", color: "var(--chart-3)" },
          nonReussi: { label: "Non réussi", color: "var(--chart-4)" },
        } satisfies ChartConfig}
        dataKeys={["reussi", "nonReussi"]}
        totalLabel="% réussite"
      />

      <ChartTooltipDefault
        data={[
          { statut: "Publiés", quiz: publishedQuizzes },
          { statut: "Brouillons", quiz: draftQuizzes },
        ]}
        title="Distribution des quiz"
        description="Publiés vs brouillons"
        config={{
          quiz: { label: "Quiz", color: "var(--chart-1)" },
        } satisfies ChartConfig}
        dataKeys={["quiz"]}
        categoryKey="statut"
      />
    </div>
  )
}
