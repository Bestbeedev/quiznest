import type { Metadata } from "next";
import { CreditCard, TrendingUp, Wallet } from "lucide-react";

import { getRevenueStats, getSubscriptionStatsByPlan, getMonthlyRevenueTrend } from "@/lib/services/billing";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueChart } from "./revenue-chart";

export const metadata: Metadata = {
  title: "Revenus — Admin QuizNest",
};

export default async function AdminRevenuePage() {
  const [revenue, planStats, monthlyTrend] = await Promise.all([
    getRevenueStats(),
    getSubscriptionStatsByPlan(),
    getMonthlyRevenueTrend(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenus</h1>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble des revenus de la plateforme.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Revenu total" value={formatCurrency(revenue.totalRevenue)} />
        <StatCard icon={TrendingUp} label="Revenu ce mois-ci" value={formatCurrency(revenue.monthToDateRevenue)} />
        <StatCard icon={CreditCard} label="Abonnements actifs" value={String(revenue.activeSubscriptions)} />
      </div>

      <RevenueChart monthlyTrend={monthlyTrend} />

      <Card>
        <CardHeader>
          <CardTitle>Répartition par plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Abonnés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planStats.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    {plan.price === null ? "Sur devis" : formatCurrency(plan.price, plan.currency)}
                  </TableCell>
                  <TableCell>{plan.subscriberCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
