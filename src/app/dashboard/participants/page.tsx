import type { Metadata } from "next";
import { AlertOctagon, CheckCircle2, Clock, Target, TrendingUp, Users } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllOrgParticipants, getOrgParticipantsTrend } from "@/lib/services/participation";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { formatDuration } from "@/lib/format";
import { ParticipantsCharts } from "./participants-charts";
import { ParticipantsTimelineChart } from "./participants-timeline-chart";
import { ParticipantsView } from "./participants-view";
import { ParticipantsExportButtons } from "@/features/quiz/components/participants-export-buttons";

export const metadata: Metadata = {
  title: "Participants — QuizNest",
};

function StatItem({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: typeof Users;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex size-10 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Participants"
        subtitle="Suivez qui a répondu à vos évaluations et leurs résultats."
        actions={
          participants.length > 0 ? <ParticipantsExportButtons participants={participants} /> : undefined
        }
      />

      {participants.length === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="Aucun participant pour le moment"
          description="Publiez un quiz et partagez son lien ou code d'accès pour voir apparaître vos participants ici."
        />
      ) : (
        <>
          <Section title="Statistiques" description="Vue d'ensemble des participations">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatItem icon={Users} iconColor="bg-primary/10 text-primary" label="Total" value={String(participants.length)} />
              <StatItem icon={CheckCircle2} iconColor="bg-emerald-500/10 text-emerald-500" label="Terminé" value={String(completed.length)} />
              <StatItem icon={Clock} iconColor="bg-amber-500/10 text-amber-500" label="En cours" value={String(inProgress.length)} />
              <StatItem icon={AlertOctagon} iconColor="bg-destructive/10 text-destructive" label="Abandonné" value={String(abandoned.length)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatItem icon={TrendingUp} iconColor="bg-blue-500/10 text-blue-500" label="Score moyen" value={avgScore !== null ? `${avgScore}%` : "—"} />
              <StatItem icon={Target} iconColor="bg-primary/10 text-primary" label="Taux de réussite" value={passRate !== null ? `${passRate}%` : "—"} />
              <StatItem icon={Clock} iconColor="bg-primary/10 text-primary" label="Temps moyen" value={avgTime !== null ? formatDuration(avgTime) : "—"} />
            </div>
          </Section>

          <Section title="Tendances" description="Évolution sur les 14 derniers jours">
            <ParticipantsTimelineChart trend={trend} />
          </Section>

          <Section title="Répartition" description="Distribution par statut et performance">
            <ParticipantsCharts
              completed={completed.length}
              inProgress={inProgress.length}
              abandoned={abandoned.length}
              avgScore={avgScore}
            />
          </Section>

          <Section title="Tous les participants" description="Liste complète des tentatives">
            <ParticipantsView participants={participants} />
          </Section>
        </>
      )}
    </div>
  );
}
