"use client";

import { ChartAreaInteractive } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";

export function ParticipantsTimelineChart({ trend }: { trend: { date: string; participants: number }[] }) {
  return (
    <ChartAreaInteractive
      data={trend}
      title="Timeline des participants"
      description="14 derniers jours, tous quiz confondus"
      config={{
        participants: { label: "Participants", color: "var(--chart-2)" },
      } satisfies ChartConfig}
      dataKeys={["participants"]}
      timeRanges={[{ label: "14 jours", value: "90d" }]}
    />
  );
}
