import type { Metadata } from "next";
import { CheckCircle2, ListChecks, Percent, Rocket, Users, Sparkles, Zap } from "lucide-react";

import { getActiveOrganization } from "@/lib/db/tenant";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tableau de bord",
  description:
    "Vue d'ensemble de votre espace QuizNest : quiz, participants, taux de réussite et statistiques en temps réel.",
  path: "/dashboard",
});
import {
  getQuizStats,
  getRecentQuizzes,
  getQuizCreationTrend,
  getQuizStatusBreakdown,
  getTopQuizzesByParticipation,
} from "@/lib/services/quiz";
import {
  getOrgParticipantStats,
  getOrgParticipantsTrend,
  getParticipantStatusBreakdown,
} from "@/lib/services/participation";
import { getOrgRecentActivity, type OrgActivityItem } from "@/lib/services/activity";
import { getOrganizationRevenueStats, getOrganizationSubscription } from "@/lib/services/billing";
import { getOrganizationMembers } from "@/lib/services/organization";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Reveal } from "@/components/shared/reveal";
import { RecentQuizzesCard } from "@/features/dashboard/components/recent-quizzes-card";
import { ActivityFeedCard } from "@/features/dashboard/components/activity-feed-card";
import { RevenueSummaryCard } from "@/features/dashboard/components/revenue-summary-card";
import { MembersOverviewCard } from "@/features/dashboard/components/members-overview-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { QuizStatusPanel } from "@/features/dashboard/components/quiz-status-panel";
import { TopQuizzesList } from "@/features/dashboard/components/top-quizzes-list";
import { LastUpdatedPill } from "@/features/dashboard/components/last-updated-pill";
import { NotificationsBanner, type DashboardNotification } from "@/features/dashboard/components/notifications-banner";
import { UpgradeBanner } from "@/features/dashboard/components/upgrade-banner";
import { ChartAreaInteractive, ChartDonutTotal } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";

function computeTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return null;
    return { direction: "up" as const, value: "Nouveau" };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return null;
  return { direction: (change > 0 ? "up" : "down") as "up" | "down", value: `${change > 0 ? "+" : ""}${change}%` };
}

export default async function DashboardPage() {
  const organization = await getActiveOrganization();
  if (!organization) return null;

  const [
    stats,
    recentQuizzes,
    participantStats,
    creationTrend,
    participantsTrend,
    quizStatusBreakdown,
    participantStatusBreakdown,
    topQuizzes,
  ] = await Promise.all([
    getQuizStats(organization.id),
    getRecentQuizzes(organization.id),
    getOrgParticipantStats(organization.id),
    getQuizCreationTrend(organization.id),
    getOrgParticipantsTrend(organization.id, 30),
    getQuizStatusBreakdown(organization.id),
    getParticipantStatusBreakdown(organization.id),
    getTopQuizzesByParticipation(organization.id),
  ]);

  const [activityResult, revenueResult, subscriptionResult, membersResult] = await Promise.allSettled([
    getOrgRecentActivity(organization.id),
    getOrganizationRevenueStats(organization.id),
    getOrganizationSubscription(organization.id),
    getOrganizationMembers(organization.id),
  ]);

  const activity: OrgActivityItem[] = activityResult.status === "fulfilled" ? activityResult.value : [];
  const revenue = revenueResult.status === "fulfilled" ? revenueResult.value : null;
  const subscription = subscriptionResult.status === "fulfilled" ? subscriptionResult.value : null;
  const members = membersResult.status === "fulfilled" ? membersResult.value : [];

  const notifications: DashboardNotification[] = [];
  const plan = subscription?.plan;
  if (plan?.quizLimit !== undefined && plan?.quizLimit !== null && stats.total >= plan.quizLimit) {
    notifications.push({
      id: "quiz-limit",
      variant: "destructive",
      title: "Limite de quiz atteinte",
      message: `Vous avez atteint la limite de ${plan.quizLimit} quiz de votre plan ${plan.name}.`,
      actionHref: "/dashboard/billing",
      actionLabel: "Changer de plan",
    });
  }
  if (stats.total > 0 && stats.published === 0) {
    notifications.push({
      id: "no-published",
      variant: "default",
      title: "Aucun quiz publié",
      message: "Publiez un quiz pour commencer à recevoir des réponses.",
      actionHref: "/dashboard/quiz",
      actionLabel: "Voir mes quiz",
    });
  }
  if (stats.total > 0 && stats.questionCount === 0) {
    notifications.push({
      id: "no-questions",
      variant: "default",
      title: "Aucune question",
      message: "Ajoutez des questions à vos quiz pour pouvoir les publier.",
      actionHref: "/dashboard/quiz",
      actionLabel: "Voir mes quiz",
    });
  }

  const quizTrend = computeTrend(
    creationTrend.at(-1)?.quiz ?? 0,
    creationTrend.at(-2)?.quiz ?? 0,
  );
  const last7 = participantsTrend.slice(-7).reduce((sum, d) => sum + d.participants, 0);
  const prev7 = participantsTrend.slice(-14, -7).reduce((sum, d) => sum + d.participants, 0);
  const participantsTrendDelta = computeTrend(last7, prev7);

  const totalTrackedParticipants =
    participantStatusBreakdown.COMPLETED + participantStatusBreakdown.IN_PROGRESS + participantStatusBreakdown.ABANDONED;
  const completionRate =
    totalTrackedParticipants > 0
      ? Math.round((participantStatusBreakdown.COMPLETED / totalTrackedParticipants) * 100)
      : null;

  const isFree = plan?.slug === "free";
  const quizLimit = plan?.quizLimit;
  const approachingLimit = quizLimit !== null && quizLimit !== undefined && stats.total >= quizLimit * 0.8;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Tableau de bord"
        subtitle={organization.name}
        actions={
          <LastUpdatedPill
            formattedDate={new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        }
      />

      <NotificationsBanner notifications={notifications} />

      {isFree && (
        <UpgradeBanner
          title="Passez au Professional"
          description="Accédez à des fonctionnalités avancées pour tirer le meilleur parti de vos quiz."
          variant="default"
          features={[
            "Quiz illimités",
            "Participants illimités",
            "IA Premium",
            "Statistiques avancées",
          ]}
          icon={Sparkles}
          ctaLabel="Voir les plans"
        />
      )}

      {!isFree && approachingLimit && quizLimit !== null && quizLimit !== undefined && (
        <UpgradeBanner
          title="Vous approchez de votre limite"
          description={`Vous avez utilisé ${stats.total} sur ${quizLimit} quiz. Passez à un plan supérieur pour continuer sans limite.`}
          variant="compact"
          icon={Zap}
          ctaLabel="Upgrade"
        />
      )}

      <Section title="Actions rapides">
        <QuickActions />
      </Section>

      <Section title="Aperçu" description="Statistiques clés de votre organisation">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Reveal>
            <StatCard icon={ListChecks} label="Quiz créés" value={String(stats.total)} trend={quizTrend ? { ...quizTrend, comparisonLabel: "vs semaine dernière" } : undefined} />
          </Reveal>
          <Reveal delay={0.05}>
            <StatCard icon={Rocket} label="Quiz publiés" value={String(stats.published)} />
          </Reveal>
          <Reveal delay={0.1}>
            <StatCard
              icon={Users}
              label="Participants"
              value={String(participantStats.totalParticipants)}
              trend={participantsTrendDelta ? { ...participantsTrendDelta, comparisonLabel: "vs 7j précédents" } : undefined}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <StatCard
              icon={Percent}
              label="Taux de réussite"
              value={participantStats.passRate === null ? "—" : `${participantStats.passRate}%`}
              hint={participantStats.passRate === null ? "Bientôt disponible" : undefined}
              muted={participantStats.passRate === null}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <StatCard
              icon={CheckCircle2}
              label="Taux de complétion"
              value={completionRate === null ? "—" : `${completionRate}%`}
              hint={completionRate === null ? "Bientôt disponible" : undefined}
              muted={completionRate === null}
            />
          </Reveal>
        </div>
      </Section>

      <Section title="Tendances" description="Évolution de la participation">
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            {participantsTrend.some((d) => d.participants > 0) ? (
              <ChartAreaInteractive
                data={participantsTrend.map((d) => ({ date: d.date, participants: d.participants }))}
                title="Participation"
                description="Tentatives quotidiennes sur vos quiz"
                config={{
                  participants: { label: "Participants", color: "var(--chart-1)" },
                } satisfies ChartConfig}
                dataKeys={["participants"]}
                timeRanges={[
                  { label: "30 jours", value: "30d" },
                  { label: "14 jours", value: "14d" },
                  { label: "7 jours", value: "7d" },
                ]}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border p-8 text-center text-sm text-muted-foreground">
                Publiez un quiz et partagez son lien pour voir la participation ici.
              </div>
            )}
          </Reveal>
          <Reveal delay={0.02}>
            <QuizStatusPanel breakdown={quizStatusBreakdown} />
          </Reveal>
        </div>
      </Section>

      <Section title="Activité" description="Résumé des participations et quiz populaires">
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal>
            {totalTrackedParticipants > 0 ? (
              <ChartDonutTotal
                data={[
                  { statut: "termine", nombre: participantStatusBreakdown.COMPLETED, fill: "var(--color-termine)" },
                  { statut: "en_cours", nombre: participantStatusBreakdown.IN_PROGRESS, fill: "var(--color-en_cours)" },
                  { statut: "abandonne", nombre: participantStatusBreakdown.ABANDONED, fill: "var(--color-abandonne)" },
                ]}
                title="Statut des participations"
                config={{
                  nombre: { label: "Participants" },
                  termine: { label: "Terminé", color: "var(--chart-2)" },
                  en_cours: { label: "En cours", color: "var(--chart-3)" },
                  abandonne: { label: "Abandonné", color: "var(--chart-5)" },
                } satisfies ChartConfig}
                dataKey="nombre"
                nameKey="statut"
                totalLabel="Participations"
              />
            ) : (
              <div className="flex h-full min-h-[250px] items-center justify-center rounded-xl border p-8 text-center text-sm text-muted-foreground">
                Pas encore de participations à analyser.
              </div>
            )}
          </Reveal>
          <Reveal delay={0.02}>
            <ActivityFeedCard activity={activity} />
          </Reveal>
          <Reveal delay={0.04}>
            <TopQuizzesList quizzes={topQuizzes} />
          </Reveal>
        </div>
      </Section>

      <Section title="Organisation" description="Facturation, équipe et quiz récents">
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal>
            <RevenueSummaryCard
              planName={subscription?.plan.name ?? null}
              totalPaid={revenue?.totalPaid ?? 0}
              lastPaymentAt={revenue?.lastPayment?.createdAt ?? null}
            />
          </Reveal>
          <Reveal delay={0.02}>
            <MembersOverviewCard members={members} />
          </Reveal>
          <Reveal delay={0.04}>
            <RecentQuizzesCard quizzes={recentQuizzes} />
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
