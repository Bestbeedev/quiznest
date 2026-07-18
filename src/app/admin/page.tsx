import type { Metadata } from "next";
import { Building2, CreditCard, ListChecks, TrendingUp, Users } from "lucide-react";

import { getPlatformStats, getWeeklyGrowthTrend } from "@/lib/services/admin";
import { getRevenueStats } from "@/lib/services/billing";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { AdminCharts } from "./admin-charts";

export const metadata: Metadata = {
  title: "Administration — QuizNest",
};

export default async function AdminOverviewPage() {
  const [stats, revenue, growthTrend] = await Promise.all([
    getPlatformStats(),
    getRevenueStats(),
    getWeeklyGrowthTrend(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground">Gestion globale de la plateforme QuizNest.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Building2} label="Organisations" value={String(stats.organizations)} />
        <StatCard icon={Users} label="Utilisateurs" value={String(stats.users)} />
        <StatCard icon={ListChecks} label="Quiz" value={String(stats.quizzes)} />
        <StatCard icon={CreditCard} label="Abonnements actifs" value={String(stats.activeSubscriptions)} />
        <StatCard icon={TrendingUp} label="Revenu total" value={formatCurrency(revenue.totalRevenue)} />
      </div>

      <AdminCharts growthTrend={growthTrend} />
    </div>
  );
}
