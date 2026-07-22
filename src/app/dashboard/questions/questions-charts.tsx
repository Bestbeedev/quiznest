"use client"

import { Award, BarChart3, Gauge } from "lucide-react"

import { ChartLollipop } from "@/components/charts"
import type { ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TYPE_META: Record<string, { label: string; color: string }> = {
  SINGLE_CHOICE: { label: "QCM", color: "var(--chart-1)" },
  MULTIPLE_CHOICE: { label: "Choix multiple", color: "var(--chart-2)" },
  TRUE_FALSE: { label: "Vrai / Faux", color: "var(--chart-3)" },
  SHORT_ANSWER: { label: "Réponse courte", color: "var(--chart-4)" },
}

export function QuestionsCharts({
  typeData,
  difficultyData,
  totalPoints,
  totalQuestions,
}: {
  typeData: { type: string; count: number }[]
  difficultyData: { name: string; value: number }[]
  totalPoints: number
  totalQuestions: number
}) {
  const pieConfig = typeData.reduce<ChartConfig>((config, item) => {
    const meta = TYPE_META[item.type] ?? { label: item.type, color: "var(--chart-5)" }
    config[item.type] = { label: meta.label, color: meta.color }
    return config
  }, {})

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {typeData.length >= 2 ? (
        <ChartLollipop
          data={typeData.map((item) => ({
            label: TYPE_META[item.type]?.label ?? item.type,
            value: item.count,
            color: TYPE_META[item.type]?.color ?? "var(--chart-5)",
          }))}
          title="Par type"
          config={pieConfig}
          totalLabel="questions"
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Par type</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {typeData.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {TYPE_META[item.type]?.label ?? item.type}
                </span>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gauge className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Par difficulté</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {difficultyData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${totalQuestions > 0 ? (item.value / totalQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Points totaux</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-6">
          <p className="text-5xl font-bold tracking-tight text-primary">{totalPoints}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            soit {totalQuestions > 0 ? (totalPoints / totalQuestions).toFixed(1) : 0} pt/question
          </p>
          <div className="mt-4 h-2 w-full max-w-40 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min((totalPoints / (totalQuestions * 10)) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
