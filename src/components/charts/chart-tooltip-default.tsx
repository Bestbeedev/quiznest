"use client"

import { Bar, BarChart, XAxis } from "recharts"

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

/** Simple stacked bar over arbitrary categories (not necessarily dates) with the
 * default tooltip — for a small composition compared across a handful of groups. */
export function ChartTooltipDefault({
  data,
  title = "Chart",
  description,
  config,
  dataKeys,
  categoryKey = "date",
}: {
  data: { [key: string]: string | number }[]
  title?: string
  description?: string
  config: ChartConfig
  dataKeys: string[]
  categoryKey?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <XAxis dataKey={categoryKey} tickLine={false} tickMargin={10} axisLine={false} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={`var(--color-${key})`}
                radius={
                  index === 0
                    ? [0, 0, 4, 4]
                    : index === dataKeys.length - 1
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                }
              />
            ))}
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} defaultIndex={1} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
