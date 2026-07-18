import type { Metadata } from "next";
import { AlertOctagon, CheckCircle2, Clock, Target, TrendingUp, Users } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllOrgParticipants, getOrgParticipantsTrend } from "@/lib/services/participation";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { ParticipantsCharts } from "./participants-charts";
import { ParticipantsTimelineChart } from "./participants-timeline-chart";
import { ParticipantsView } from "./participants-view";
import { ParticipantsExportButtons } from "@/features/quiz/components/participants-export-buttons";

export const metadata: Metadata = {
  title: "Participants — QuizNest",
};

export default async function ParticipantsPage() {
  const organization = await requireActiveOrganization();
  const [participants, trend] = await Promise.all([
    listAllOrgParticipants(organization.id),
    getOrgParticipantsTrend(organization.id),
  ]);

  const completed = participants.filter((p) => p.status === "COMPLETED");
  const inProgress = participants.filter((p) => p.status === "IN_PROGRESS");
  const abandoned = participants.filter((p) => p.status === "ABANDONED");
  const avgScore =
    completed.length > 0
      ? Math.round(completed.reduce((sum, p) => sum + (p.percentage ?? 0), 0) / completed.length)
      : null;
  const passRate =
    completed.length > 0
      ? Math.round((completed.filter((p) => p.passed).length / completed.length) * 100)
      : null;
  const timedAttempts = completed.filter((p) => p.timeSpent !== null);
  const avgTime =
    timedAttempts.length > 0
      ? Math.round(timedAttempts.reduce((sum, p) => sum + (p.timeSpent ?? 0), 0) / timedAttempts.length)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Participants</h1>
          <p className="text-sm text-muted-foreground">
            Suivez qui a répondu à vos évaluations et leurs résultats.
          </p>
        </div>
        {participants.length > 0 && <ParticipantsExportButtons participants={participants} />}
      </div>

      {participants.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="Aucun participant pour le moment"
          description="Publiez un quiz et partagez son lien ou code d'accès pour voir apparaître vos participants ici."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{participants.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Terminé</p>
                  <p className="text-lg font-semibold">{completed.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En cours</p>
                  <p className="text-lg font-semibold">{inProgress.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertOctagon className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Abandonné</p>
                  <p className="text-lg font-semibold">{abandoned.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <TrendingUp className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Score moyen</p>
                  <p className="text-lg font-semibold">{avgScore !== null ? `${avgScore}%` : "—"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Target className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taux de réussite</p>
                  <p className="text-lg font-semibold">{passRate !== null ? `${passRate}%` : "—"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temps moyen</p>
                  <p className="text-lg font-semibold">{avgTime !== null ? formatDuration(avgTime) : "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <ParticipantsTimelineChart trend={trend} />

          <ParticipantsCharts
            completed={completed.length}
            inProgress={inProgress.length}
            abandoned={abandoned.length}
            avgScore={avgScore}
          />

          <ParticipantsView participants={participants} />
        </>
      )}
    </div>
  );
}
