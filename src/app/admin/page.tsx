import type { Metadata } from "next";
import { Building2, CreditCard, ListChecks, TrendingUp, Users } from "lucide-react";

import { getPlatformStats, getWeeklyGrowthTrend, getRecentUsers, getRecentOrganizations } from "@/lib/services/admin";
import { getRevenueStats } from "@/lib/services/billing";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { AdminCharts } from "./admin-charts";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vue d'ensemble — Admin QuizNest",
};

export default async function AdminOverviewPage() {
  const [stats, revenue, growthTrend, recentUsers, recentOrgs] = await Promise.all([
    getPlatformStats(),
    getRevenueStats(),
    getWeeklyGrowthTrend(),
    getRecentUsers(5),
    getRecentOrganizations(5),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Vue d&apos;ensemble"
        subtitle="Gestion globale de la plateforme QuizNest."
      />

      <Section title="Indicateurs clés" description="Statistiques de la plateforme en temps réel.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Building2} label="Organisations" value={String(stats.organizations)} />
          <StatCard icon={Users} label="Utilisateurs" value={String(stats.users)} />
          <StatCard icon={ListChecks} label="Quiz" value={String(stats.quizzes)} />
          <StatCard icon={CreditCard} label="Abonnements actifs" value={String(stats.activeSubscriptions)} />
          <StatCard icon={TrendingUp} label="Revenu total" value={formatCurrency(revenue.totalRevenue)} />
        </div>
      </Section>

      <Section title="Croissance" description="Évolution des inscriptions et organisations sur 8 semaines.">
        <AdminCharts growthTrend={growthTrend} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Utilisateurs récents" description="Les 5 derniers inscrits.">
          <Card>
            <CardContent className="flex flex-col divide-y">
              {recentUsers.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucun utilisateur.</p>
              )}
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {user.name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(user.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="Organisations récentes" description="Les 5 dernières créées.">
          <Card>
            <CardContent className="flex flex-col divide-y">
              {recentOrgs.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Aucune organisation.</p>
              )}
              {recentOrgs.map((org) => (
                <div key={org.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{org.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(org.createdAt)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between gap-4 py-6">
          <div>
            <p className="text-sm font-medium">Gérer les organisations</p>
            <p className="text-xs text-muted-foreground">Voir toutes les organisations de la plateforme.</p>
          </div>
          <Link href="/admin/organizations" className="text-sm font-medium text-primary hover:underline">
            Voir →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
