import type { Metadata } from "next";
import { BarChart3, Clock, BarChart } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrgParticipantStats, listAllOrgParticipants } from "@/lib/services/participation";
import { getQuizStats, listQuizzes } from "@/lib/services/quiz";
import { listAllQuestions } from "@/lib/services/question";
import { getOrganizationSubscription } from "@/lib/services/billing";
import {
  computeScoreDistribution,
  computeScoreEvolution,
  computeQuizComparison,
  computeUserAnalysis,
  rankQuestionsByDifficulty,
} from "@/lib/analytics";
import { formatDuration } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table";
import { quizComparisonColumns } from "@/features/quiz/components/quiz-comparison-columns";
import { userAnalysisColumns } from "@/features/quiz/components/user-analysis-columns";
import { AnalyticsExportButtons } from "@/features/quiz/components/analytics-export-buttons";
import { QuestionHeatmap } from "@/features/quiz/components/question-heatmap";
import { UpgradeBanner } from "@/features/dashboard/components/upgrade-banner";
import { AnalyticsCharts } from "./analytics-charts";
import { ScoreDistributionChart } from "./score-distribution-chart";
import { ScoreEvolutionChart } from "./score-evolution-chart";
import { QuizComparisonRadar } from "./quiz-comparison-radar";
import { QuestionDifficultyLists } from "./question-difficulty-lists";

export const metadata: Metadata = {
  title: "Analytics — QuizNest",
};

export default async function AnalyticsPage() {
  const organization = await requireActiveOrganization();

  const [quizStats, participantStats, participants, quizzes, questions, subscription] = await Promise.all([
    getQuizStats(organization.id),
    getOrgParticipantStats(organization.id),
    listAllOrgParticipants(organization.id),
    listQuizzes(organization.id),
    listAllQuestions(organization.id),
    getOrganizationSubscription(organization.id),
  ]);

  const plan = subscription?.plan;
  const isFree = plan?.slug === "free";

  const hasData = quizStats.total > 0 && participantStats.totalParticipants > 0;

  const completed = participants.filter((p) => p.status === "COMPLETED");
  const timedAttempts = completed.filter((p) => p.timeSpent !== null);
  const avgTime =
    timedAttempts.length > 0
      ? Math.round(timedAttempts.reduce((sum, p) => sum + (p.timeSpent ?? 0), 0) / timedAttempts.length)
      : null;

  const scoreDistribution = computeScoreDistribution(participants);
  const scoreEvolution = computeScoreEvolution(participants);
  const quizComparison = computeQuizComparison(participants, quizzes);
  const userAnalysis = computeUserAnalysis(participants);
  const { hardest, easiest } = rankQuestionsByDifficulty(questions);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Distribution des scores, taux de réussite et évolution des participants.
          </p>
        </div>
        {hasData && !isFree && <AnalyticsExportButtons quizRows={quizComparison} userRows={userAnalysis} />}
      </div>

      {isFree && (
        <UpgradeBanner
          title="Analytics avancés"
          description="Accédez à des graphiques détaillés, l'export de données et des analyses approfondies de vos participants."
          variant="card"
          features={[
            "Graphiques interactifs",
            "Export PDF, Excel & CSV",
            "Comparaison entre quiz",
            "Analyse par participant",
          ]}
          icon={BarChart}
          ctaLabel="Passer au Professional"
        />
      )}

      {!hasData ? (
        <Card>
          <CardHeader>
            <CardTitle>Pas encore de données</CardTitle>
            <CardDescription>
              Les statistiques détaillées apparaîtront ici une fois que vos quiz publiés auront reçu
              des réponses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
              <BarChart3 className="size-10 text-muted-foreground" />
              <p className="max-w-xs text-sm text-muted-foreground">
                Créez et publiez un quiz, puis partagez-le pour commencer à voir vos analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taux de réussite global
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{participantStats.passRate}%</p>
                  <Badge variant="secondary" className="text-xs">
                    {participantStats.totalParticipants} participants
                  </Badge>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${participantStats.passRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quiz publiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{quizStats.published}</p>
                  <Badge variant="secondary" className="text-xs">
                    sur {quizStats.total}
                  </Badge>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(quizStats.published / quizStats.total) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Questions créées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{quizStats.questionCount}</p>
                  <Badge variant="secondary" className="text-xs">
                    au total
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Réparties dans {quizStats.total} quiz
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Clock className="size-3.5" />
                  Temps moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{avgTime !== null ? formatDuration(avgTime) : "—"}</p>
                <p className="mt-2 text-xs text-muted-foreground">par tentative terminée</p>
              </CardContent>
            </Card>
          </div>

          <AnalyticsCharts
            totalParticipants={participantStats.totalParticipants}
            passRate={participantStats.passRate}
            totalQuizzes={quizStats.total}
            publishedQuizzes={quizStats.published}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ScoreDistributionChart distribution={scoreDistribution} />
            <ScoreEvolutionChart evolution={scoreEvolution} />
          </div>

          <QuizComparisonRadar rows={quizComparison} />

          {questions.length > 0 && <QuestionHeatmap questionStats={questions} />}

          <QuestionDifficultyLists hardest={hardest} easiest={easiest} />

          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Analyse par quiz</h2>
            <DataTable
              columns={quizComparisonColumns}
              data={quizComparison.map((r) => ({ ...r, id: r.quizId }))}
              searchColumn="title"
              searchPlaceholder="Rechercher un quiz..."
            />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Analyse par utilisateur</h2>
            <DataTable
              columns={userAnalysisColumns}
              data={userAnalysis.map((r) => ({ ...r, id: r.key }))}
              searchColumn="name"
              searchPlaceholder="Rechercher un participant..."
            />
          </div>
        </>
      )}
    </div>
  );
}
