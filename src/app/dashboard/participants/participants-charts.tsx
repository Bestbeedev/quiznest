"use client"

import { Percent, Target } from "lucide-react"

import { ChartRadialText, ChartPieLegend } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ParticipantsCharts({
  completed,
  inProgress,
  abandoned,
  avgScore,
}: {
  completed: number
  inProgress: number
  abandoned: number
  avgScore: number | null
}) {
  const total = completed + inProgress + abandoned

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartRadialText
        data={[{ name: "total", valeur: total }]}
        title="Total participants"
        description="Tous statuts confondus"
        config={{
          total: { label: "Total", color: "var(--chart-1)" },
        } satisfies ChartConfig}
        dataKey="valeur"
        valueLabel="participants"
        maxAngle={360}
      />

      {total > 0 ? (
        <ChartPieLegend
          data={[
            { statut: "termine", visitors: completed, fill: "var(--color-termine)" },
            { statut: "encours", visitors: inProgress, fill: "var(--color-encours)" },
            { statut: "abandonne", visitors: abandoned, fill: "var(--color-abandonne)" },
          ]}
          title="Répartition par statut"
          description={`${total} participant(s) au total`}
          config={{
            visitors: { label: "Participants" },
            termine: { label: "Terminé", color: "var(--chart-1)" },
            encours: { label: "En cours", color: "var(--chart-2)" },
            abandonne: { label: "Abandonné", color: "var(--chart-5)" },
          } satisfies ChartConfig}
          dataKey="visitors"
          nameKey="statut"
        />
      ) : (
        <div className="flex items-center justify-center rounded-xl border p-8 text-center text-sm text-muted-foreground">
          Aucune tentative pour le moment.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Percent className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Score moyen</p>
              <p className="text-lg font-semibold">{avgScore !== null ? `${avgScore}%` : "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Target className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux de complétion</p>
              <p className="text-lg font-semibold">
                {total > 0 ? `${Math.round((completed / total) * 100)}%` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
