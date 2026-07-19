"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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

export function ChartRadarLabelCustom({
  data,
  title = "Radar Chart",
  description,
  config,
  dataKeys,
  angleKey = "month",
}: {
  data: { [key: string]: string | number }[]
  title?: string
  description?: string
  config: ChartConfig
  dataKeys: string[]
  angleKey?: string
}) {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis
              dataKey={angleKey}
              tick={({ x, y, textAnchor, index, verticalAnchor, ...props }) => {
                const entry = data[index]
                if (!entry) return null
                const yValue = typeof y === "number" ? y : 0
                return (
                  <text
                    x={x}
                    y={yValue + (index === 0 ? -10 : 0)}
                    textAnchor={textAnchor}
                    fontSize={13}
                    fontWeight={500}
                    {...props}
                  >
                    {dataKeys.map((key, ki) => (
                      <tspan key={key}>
                        {ki > 0 && (
                          <tspan className="fill-muted-foreground">/</tspan>
                        )}
                        {entry[key]}
                      </tspan>
                    ))}
                    <tspan
                      x={x}
                      dy={"1rem"}
                      fontSize={12}
                      className="fill-muted-foreground"
                    >
                      {entry[angleKey]}
                    </tspan>
                  </text>
                )
              }}
            />
            <PolarGrid />
            {dataKeys.map((key) => (
              <Radar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
