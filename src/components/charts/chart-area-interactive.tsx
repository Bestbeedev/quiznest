"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ChartAreaInteractive({
  data,
  title = "Area Chart",
  description,
  config,
  dataKeys,
  timeRanges = [
    { label: "90j", value: "90d" },
    { label: "30j", value: "30d" },
    { label: "7j", value: "7d" },
  ],
}: {
  data: { date: string; [key: string]: string | number }[]
  title?: string
  description?: string
  config: ChartConfig
  dataKeys: string[]
  timeRanges?: { label: string; value: string }[]
}) {
  const [timeRange, setTimeRange] = React.useState(timeRanges[0]?.value ?? "90d")
  const [referenceDate] = React.useState(() => data[data.length - 1]?.date ?? "2024-06-30")

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const ref = new Date(referenceDate)
    const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90
    const start = new Date(ref)
    start.setDate(start.getDate() - days)
    return date >= start
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Select value={timeRange} onValueChange={(v) => v && setTimeRange(v)}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {timeRanges.map((tr) => (
              <SelectItem key={tr.value} value={tr.value} className="rounded-lg">
                {tr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData} margin={{ top: 16, right: 12, left: 12, bottom: 0 }}>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
              }}
            />
            <YAxis hide domain={[0, (max: number) => (max > 0 ? Math.ceil(max * 1.2) : 5)]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
                  }
                  indicator="dot"
                />
              }
            />
            {dataKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={`url(#fill-${key})`}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
