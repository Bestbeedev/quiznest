"use client";

import { useState } from "react";
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, Clock, Percent, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLineInteractive, ChartTooltipDefault } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";
import { QuestionHeatmap } from "@/features/quiz/components/question-heatmap";
import { AiSummaryCard } from "@/features/quiz/components/ai-summary-card";
import { ResultsExportButtons } from "@/features/quiz/components/results-export-buttons";
import { formatDuration } from "@/lib/format";
import type { Participant } from "@/generated/prisma/client";

type QuestionStat = { id: string; title: string; successRate: number | null };
type ScoreBucket = { bucket: string; count: number };
type AttemptsPoint = { date: string; tentatives: number };

const PAGE_SIZE = 15;

export function ResultsTab({
  quizTitle,
  participants,
  totalCompleted,
  averageScore,
  passRate,
  averageTimeSpent,
  scoreDistribution,
  questionStats,
  attemptsTrend,
}: {
  quizTitle: string;
  participants: Participant[];
  totalCompleted: number;
  averageScore: number | null;
  passRate: number | null;
  averageTimeSpent: number | null;
  scoreDistribution: ScoreBucket[];
  questionStats: QuestionStat[];
  attemptsTrend: AttemptsPoint[];
}) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(questionStats.length / PAGE_SIZE);
  const paged = questionStats.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (totalCompleted === 0) {
    return (
      <EmptyStateCard
        icon={BarChart3}
        title="Pas encore de résultats"
        description="Les statistiques apparaîtront après les premières tentatives terminées."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <ResultsExportButtons
          quizTitle={quizTitle}
          participants={participants}
          totalCompleted={totalCompleted}
          averageScore={averageScore}
          passRate={passRate}
          averageTimeSpent={averageTimeSpent}
          questionStats={questionStats}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Tentatives terminées" value={String(totalCompleted)} />
        <StatCard icon={Percent} label="Score moyen" value={`${averageScore}%`} />
        <StatCard icon={BarChart3} label="Taux de réussite" value={`${passRate}%`} />
        <StatCard
          icon={Clock}
          label="Temps moyen"
          value={averageTimeSpent === null ? "—" : formatDuration(averageTimeSpent)}
          hint={averageTimeSpent === null ? "Non mesuré" : undefined}
          muted={averageTimeSpent === null}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartTooltipDefault
          data={scoreDistribution}
          title="Distribution des scores"
          description="Nombre de participants par tranche de score"
          config={{ count: { label: "Participants", color: "var(--chart-1)" } } satisfies ChartConfig}
          dataKeys={["count"]}
          categoryKey="bucket"
        />

        <ChartLineInteractive
          data={attemptsTrend}
          title="Évolution des tentatives"
          description="14 derniers jours"
          config={{
            views: { label: "Total" },
            tentatives: { label: "Tentatives", color: "var(--chart-2)" },
          } satisfies ChartConfig}
        />
      </div>

      <AiSummaryCard />

      <QuestionHeatmap questionStats={questionStats} />

      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setBreakdownOpen(!breakdownOpen)}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">Réussite par question</CardTitle>
              <p className="text-xs text-muted-foreground">
                {questionStats.length} question{questionStats.length !== 1 ? "s" : ""}
                {breakdownOpen && totalPages > 1 && ` — page ${page + 1}/${totalPages}`}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
              {breakdownOpen ? <ChevronDown className="size-4 rotate-180" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </CardHeader>
        {breakdownOpen && (
          <CardContent>
            <div className="flex flex-col gap-3">
              {paged.map((question) => (
                <div key={question.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="min-w-0 truncate font-medium">{question.title}</span>
                    <span className="shrink-0 pl-2 text-muted-foreground">
                      {question.successRate === null ? "—" : `${question.successRate}%`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${question.successRate ?? 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                  Précédent
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, questionStats.length)} sur{" "}
                  {questionStats.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
