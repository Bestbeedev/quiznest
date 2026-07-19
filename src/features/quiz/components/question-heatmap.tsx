"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionStat = { id: string; title: string; successRate: number | null };

function heatColor(rate: number | null) {
  if (rate === null) return "bg-muted text-muted-foreground";
  if (rate >= 80) return "bg-primary text-primary-foreground";
  if (rate >= 60) return "bg-primary/70 text-primary-foreground";
  if (rate >= 40) return "bg-amber-500/70 text-white";
  if (rate >= 20) return "bg-destructive/60 text-white";
  return "bg-destructive text-white";
}

export function QuestionHeatmap({ questionStats }: { questionStats: QuestionStat[] }) {
  const [expanded, setExpanded] = useState(false);

  const easy = questionStats.filter((q) => q.successRate !== null && q.successRate >= 80).length;
  const medium = questionStats.filter((q) => q.successRate !== null && q.successRate >= 40 && q.successRate < 80).length;
  const hard = questionStats.filter((q) => q.successRate !== null && q.successRate < 40).length;
  const noData = questionStats.filter((q) => q.successRate === null).length;

  return (
    <Card>
      <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">Heatmap des questions</CardTitle>
            <CardDescription className="mt-1">
              {easy} faciles · {medium} moyennes · {hard} difficiles
              {noData > 0 && ` · ${noData} sans données`}
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="max-h-56 overflow-y-auto rounded-lg border p-3">
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
              {questionStats.map((question, index) => (
                <div
                  key={question.id}
                  title={`${question.title} — ${question.successRate === null ? "aucune donnée" : `${question.successRate}%`}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl py-6 text-xs font-semibold",
                    heatColor(question.successRate),
                  )}
                >
                  <span>Q{index + 1}</span>
                  <span className="text-[10px] font-normal opacity-90">
                    {question.successRate === null ? "—" : `${question.successRate}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
