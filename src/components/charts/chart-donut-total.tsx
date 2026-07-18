"use client"

import { Label, Pie, PieChart } from "recharts"

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

/** Full-ring donut with the total called out in the center — the "N total,
 * split by category" shape, distinct from [[ChartRadialStacked]]'s half-ring
 * "part vs whole" shape. */
export function ChartDonutTotal({
  data,
  title = "Donut Chart",
  description,
  config,
  dataKey,
  nameKey = "name",
  totalLabel = "Total",
}: {
  data: { [key: string]: string | number }[]
  title?: string
  description?: string
  config: ChartConfig
  dataKey: string
  nameKey?: string
  totalLabel?: string
}) {
  const total = data.reduce((sum, item) => sum + Number(item[dataKey] ?? 0), 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={70} outerRadius={100} strokeWidth={4}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-2xl font-bold">
                          {total.toLocaleString("fr-FR")}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground text-xs">
                          {totalLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-translate-y-1 flex-wrap gap-2 *:basis-1/3 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
