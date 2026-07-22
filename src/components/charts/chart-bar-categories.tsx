"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export function ChartBarCategories({
  data,
  title = "Bar Chart",
  description,
  config,
  totalLabel = "Total",
}: {
  data: { label: string; value: number; fill?: string }[]
  title?: string
  description?: string
  config: ChartConfig
  totalLabel?: string
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const configKeys = Object.keys(config)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <p className="text-2xl font-bold">
          {total.toLocaleString("fr-FR")}{" "}
          <span className="text-xs font-normal text-muted-foreground">{totalLabel}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-1 pb-0 pt-4">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
            layout="vertical"
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={100}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 14)}…` : value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => [Number(value).toLocaleString("fr-FR"), ""]}
                />
              }
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill ?? `var(--color-${configKeys[index] ?? "chart-1"})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
