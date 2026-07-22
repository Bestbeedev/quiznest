import type { Metadata } from "next";
import { CheckCircle2, ListChecks, Percent, Rocket, Users, Plus, TrendingUp, TrendingDown, Clock, Award, BarChart3, Zap, CreditCard, Users2, FileText } from "lucide-react";

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
import { getOrCreateWallet } from "@/lib/services/wallet";
import { canUseFeature } from "@/lib/services/feature-gate";

// Composants UI de base (shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive, ChartLollipop } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";

// Utilitaires (gardés)
function computeTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return null;
    return { direction: "up" as const, value: "Nouveau" };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return null;
  return { direction: (change > 0 ? "up" : "down") as "up" | "down", value: `${change > 0 ? "+" : ""}${change}%` };
}

// Petit composant pour afficher une tendance avec icône
function TrendIndicator({ trend }: { trend: { direction: 'up' | 'down', value: string } | null }) {
  if (!trend) return <span className="text-xs text-muted-foreground">Stable</span>;
  const Icon = trend.direction === 'up' ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center text-xs font-medium ${trend.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
      <Icon className="h-3 w-3 mr-1" />
      {trend.value}
    </span>
  );
}

export default async function DashboardPage() {
  const organization = await getActiveOrganization();
  if (!organization) return null;

  // Tous les appels asynchrones (inchangés)
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

  const [activityResult, revenueResult, subscriptionResult, membersResult, walletResult, aiQuotaResult] = await Promise.allSettled([
    getOrgRecentActivity(organization.id),
    getOrganizationRevenueStats(organization.id),
    getOrganizationSubscription(organization.id),
    getOrganizationMembers(organization.id),
    getOrCreateWallet(organization.id),
    canUseFeature(organization.id, "AI_GENERATION"),
  ]);

  const activity: OrgActivityItem[] = activityResult.status === "fulfilled" ? activityResult.value : [];
  const revenue = revenueResult.status === "fulfilled" ? revenueResult.value : null;
  const subscription = subscriptionResult.status === "fulfilled" ? subscriptionResult.value : null;
  const members = membersResult.status === "fulfilled" ? membersResult.value : [];
  const walletBalance = walletResult.status === "fulfilled" ? walletResult.value.balance : 0;
  const aiQuota = aiQuotaResult.status === "fulfilled" ? aiQuotaResult.value : { limit: null, used: 0, source: "plan" as const };

  const plan = subscription?.plan;
  const isFreePlan = plan?.slug === "free";

  // Calculs de tendance
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

  // Données pour les graphiques (inchangées)
  const chartConfig = {
    participants: { label: "Participants", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  const statusChartConfig = {
    termine: { label: "Terminé", color: "var(--chart-2)" },
    en_cours: { label: "En cours", color: "var(--chart-3)" },
    abandonne: { label: "Abandonné", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ========== EN-TÊTE HERO ========== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
              <p className="mt-1 text-indigo-100">{organization.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Button size="sm" className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau quiz
              </Button>
            </div>
          </div>
          {/* mini stats dans l'en-tête */}
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-200">Quiz total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-200">Participants</p>
              <p className="text-2xl font-bold">{participantStats.totalParticipants}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-200">Taux de réussite</p>
              <p className="text-2xl font-bold">{participantStats.passRate ?? '—'}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-xs text-indigo-200">Complétion</p>
              <p className="text-2xl font-bold">{completionRate ?? '—'}%</p>
            </div>
          </div>
        </div>

        {/* ========== KPI AVEC TENDANCES ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Carte 1 */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quiz créés</p>
                  <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <ListChecks className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendIndicator trend={quizTrend} />
                <span className="text-xs text-muted-foreground">vs semaine dernière</span>
              </div>
            </CardContent>
          </Card>

          {/* Carte 2 */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Publiés</p>
                  <p className="text-2xl font-bold mt-1">{stats.published}</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Rocket className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}% publié
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Carte 3 */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold mt-1">{participantStats.totalParticipants}</p>
                </div>
                <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <TrendIndicator trend={participantsTrendDelta} />
                <span className="text-xs text-muted-foreground">vs 7j</span>
              </div>
            </CardContent>
          </Card>

          {/* Carte 4 */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Réussite</p>
                  <p className="text-2xl font-bold mt-1">{participantStats.passRate ?? '—'}%</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Percent className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={participantStats.passRate ?? 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Carte 5 */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Complétion</p>
                  <p className="text-2xl font-bold mt-1">{completionRate ?? '—'}%</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={completionRate ?? 0} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========== QUOTAS (BARRES DE PROGRESSION STYLISÉES) ========== */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Vos quotas
            </CardTitle>
            <CardDescription>Utilisation de vos ressources ce mois</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between text-sm">
                <span>Quiz</span>
                <span className="font-medium">{stats.total} / {plan?.quizLimit ?? '∞'}</span>
              </div>
              <Progress value={plan?.quizLimit ? (stats.total / plan.quizLimit) * 100 : 0} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Participants</span>
                <span className="font-medium">{participantStats.totalParticipants} / {plan?.participantLimit ?? '∞'}</span>
              </div>
              <Progress value={plan?.participantLimit ? (participantStats.totalParticipants / plan.participantLimit) * 100 : 0} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>IA (générations)</span>
                <span className="font-medium">{aiQuota.used ?? 0} / {aiQuota.limit ?? '∞'}</span>
              </div>
              <Progress value={aiQuota.limit ? ((aiQuota.used ?? 0) / aiQuota.limit) * 100 : 0} className="h-2 mt-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Portefeuille</span>
                <span className="font-medium">{walletBalance} €</span>
              </div>
              <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: '70%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========== ANALYTICS (2 LIGNES) ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique participation (2/3) */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Participation</CardTitle>
              <CardDescription>Tentatives quotidiennes sur vos quiz</CardDescription>
            </CardHeader>
            <CardContent>
              {participantsTrend.some((d) => d.participants > 0) ? (
                <ChartAreaInteractive
                  data={participantsTrend.map((d) => ({ date: d.date, participants: d.participants }))}
                  title=""
                  description=""
                  config={chartConfig}
                  dataKeys={["participants"]}
                  timeRanges={[
                    { label: "30 jours", value: "30d" },
                    { label: "14 jours", value: "14d" },
                    { label: "7 jours", value: "7d" },
                  ]}
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-xl border-2 border-dashed text-muted-foreground">
                  <p>Publiez un quiz pour voir la participation</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statut des quiz (1/3) */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Statut des quiz</CardTitle>
              <CardDescription>Répartition par état</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(quizStatusBreakdown).map(([status, count]) => {
                  const total = Object.values(quizStatusBreakdown).reduce((a, b) => a + b, 0) || 1;
                  const percent = Math.round((count / total) * 100);
                  const colorMap: Record<string, string> = {
                    DRAFT: 'bg-slate-400',
                    PUBLISHED: 'bg-emerald-500',
                    ARCHIVED: 'bg-amber-500',
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{status.toLowerCase()}</span>
                        <span className="font-medium">{count} ({percent}%)</span>
                      </div>
                      <Progress value={percent} className={`h-2 mt-1 ${colorMap[status] || 'bg-primary'}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deuxième ligne : statut participants, top quiz, activité */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Statut participants (graphique lollipop) */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Statut des participations</CardTitle>
              <CardDescription>{totalTrackedParticipants} participation(s) au total</CardDescription>
            </CardHeader>
            <CardContent>
              {totalTrackedParticipants > 0 ? (
                <ChartLollipop
                  data={[
                    { label: "Terminé", value: participantStatusBreakdown.COMPLETED, color: "var(--chart-2)" },
                    { label: "En cours", value: participantStatusBreakdown.IN_PROGRESS, color: "var(--chart-3)" },
                    { label: "Abandonné", value: participantStatusBreakdown.ABANDONED, color: "var(--chart-5)" },
                  ]}
                  title=""
                  description=""
                  config={statusChartConfig}
                  totalLabel="participations"
                />
              ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">Aucune participation</div>
              )}
            </CardContent>
          </Card>

          {/* Top quizzes */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Top quiz</CardTitle>
              <CardDescription>Les plus populaires</CardDescription>
            </CardHeader>
            <CardContent>
              {topQuizzes.length > 0 ? (
                <ul className="space-y-3">
                  {topQuizzes.slice(0, 3).map((quiz, idx) => (
                    <li key={quiz.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full h-6 w-6 flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm truncate max-w-[140px]">{quiz.title}</span>
                      </div>
                      <span className="text-sm font-medium">{quiz.participants}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-8">Aucun quiz populaire</div>
              )}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Dernières actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <ul className="space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 p-1 rounded-full bg-primary/10 text-primary">
                        <FileText className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.detail ?? item.label}</p>
                        <p className="text-muted-foreground text-xs">{item.label}</p>
                        <span className="text-[10px] text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-8">Aucune activité récente</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========== ORGANISATION ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Revenus */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                Revenus
              </CardTitle>
              <CardDescription>Plan {subscription?.plan.name ?? 'Gratuit'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{revenue?.totalPaid ?? 0} €</p>
              <p className="text-sm text-muted-foreground mt-1">
                Dernier paiement : {revenue?.lastPayment?.createdAt ? new Date(revenue.lastPayment.createdAt).toLocaleDateString() : '—'}
              </p>
            </CardContent>
          </Card>

          {/* Membres */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-emerald-500" />
                Membres
              </CardTitle>
              <CardDescription>Équipe actuelle</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{members.length}</p>
              <div className="mt-2 flex -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <div key={m.id} className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white">
                    {m.user?.name?.[0] || '?'}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-white">
                    +{members.length - 4}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz récents */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Quiz récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length > 0 ? (
                <ul className="space-y-2">
                  {recentQuizzes.slice(0, 3).map((q) => (
                    <li key={q.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <span className="truncate max-w-[150px] text-sm">{q.title}</span>
                      <Badge variant={q.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                        {q.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted-foreground py-8">Aucun quiz récent</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========== UPGRADE BANNER (si gratuit) ========== */}
        {isFreePlan && (
          <Card className="border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl">
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Passez au niveau supérieur</h3>
                <p className="text-indigo-100">Débloquez l'IA, les exports, les certificats et les analytics avancés.</p>
              </div>
              <Button variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Voir les plans
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}