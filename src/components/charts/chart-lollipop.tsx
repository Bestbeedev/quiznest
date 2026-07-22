"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"

export function ChartLollipop({
  data,
  title = "Lollipop Chart",
  description,
  config,
  totalLabel = "Total",
}: {
  data: { label: string; value: number; color?: string }[]
  title?: string
  description?: string
  config: ChartConfig
  totalLabel?: string
}) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const max = Math.max(...data.map((d) => d.value), 1)

  const configKeys = Object.keys(config)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <p className="text-2xl font-bold">
          {total.toLocaleString("fr-FR")}{" "}
          <span className="text-xs font-normal text-muted-foreground">{totalLabel}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pt-2">
        <div className="flex flex-col gap-3">
          {data.map((entry, index) => {
            const pct = max > 0 ? (entry.value / max) * 100 : 0
            const color =
              entry.color ?? `var(--color-${configKeys[index] ?? "chart-1"})`
            const isHovered = hovered === index

            return (
              <div
                key={entry.label}
                className="group flex items-center gap-3"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="w-24 shrink-0 truncate text-right text-xs text-muted-foreground">
                  {entry.label}
                </span>
                <div className="relative flex flex-1 items-center">
                  <div className="h-px w-full bg-border" />
                  <div
                    className="absolute left-0 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      opacity: isHovered ? 1 : 0.7,
                    }}
                  />
                  <div
                    className="absolute size-3 rounded-full border-2 border-background transition-all duration-300 group-hover:scale-125"
                    style={{
                      left: `calc(${pct}% - 6px)`,
                      backgroundColor: color,
                      boxShadow: isHovered
                        ? `0 0 0 4px ${color}20`
                        : "none",
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums">
                  {entry.value.toLocaleString("fr-FR")}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
