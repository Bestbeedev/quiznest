"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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

/** Two-part (or more) composition of a whole, stacked into a single half-donut
 * with the total called out in the center — the honest alternative to a 2-slice
 * pie chart for "X vs Y out of a total" data. */
export function ChartRadialStacked({
  data,
  title = "Radial Chart",
  description,
  config,
  dataKeys,
  totalLabel = "Total",
}: {
  data: { [key: string]: string | number }[]
  title?: string
  description?: string
  config: ChartConfig
  dataKeys: string[]
  totalLabel?: string
}) {
  const total = dataKeys.reduce((sum, key) => sum + Number(data[0]?.[key] ?? 0), 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-h-[250px]"
        >
          <RadialBarChart data={data} endAngle={180} innerRadius={80} outerRadius={110}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            {dataKeys.map((key) => (
              <RadialBar
                key={key}
                dataKey={key}
                stackId="a"
                cornerRadius={5}
                fill={`var(--color-${key})`}
                className="stroke-transparent stroke-2"
              />
            ))}
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          {totalLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-1 flex-wrap gap-2 *:basis-1/3 *:justify-center"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
