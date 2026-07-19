"use client";

import { BarChart3, Clock, Percent, Users } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { ChartLineInteractive, ChartTooltipDefault } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";
import { QuestionAnalysis } from "@/features/quiz/components/question-analysis";
import { AiSummaryCard } from "@/features/quiz/components/ai-summary-card";
import { ResultsExportButtons } from "@/features/quiz/components/results-export-buttons";
import { formatDuration } from "@/lib/format";
import type { Participant } from "@/generated/prisma/client";

type QuestionStat = {
  id: string;
  title: string;
  order: number;
  difficulty: string;
  category: string | null;
  successRate: number | null;
};
type ScoreBucket = { bucket: string; count: number };
type AttemptsPoint = { date: string; tentatives: number };

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

      <QuestionAnalysis questionStats={questionStats} />
    </div>
  );
}
