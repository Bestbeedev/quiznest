import type { Metadata } from "next";
import { buildMetadata } from "@/constants/seo";
import { CreditCard, TrendingUp, Wallet } from "lucide-react";

import { getRevenueStats, getSubscriptionStatsByPlan, getMonthlyRevenueTrend } from "@/lib/services/billing";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "./revenue-chart";

export const metadata: Metadata = buildMetadata({
  title: "Revenus",
  description: "Revenus de la plateforme : chiffre d'affaires, abonnements actifs et tendances mensuelles.",
  path: "/admin/revenue",
  noindex: true,
});

export default async function AdminRevenuePage() {
  const [revenue, planStats, monthlyTrend] = await Promise.all([
    getRevenueStats(),
    getSubscriptionStatsByPlan(),
    getMonthlyRevenueTrend(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Revenus"
        subtitle="Vue d'ensemble des revenus de la plateforme."
      />

      <Section title="Indicateurs" description="Chiffres clés des revenus.">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Wallet} label="Revenu total" value={formatCurrency(revenue.totalRevenue)} />
          <StatCard icon={TrendingUp} label="Revenu ce mois-ci" value={formatCurrency(revenue.monthToDateRevenue)} />
          <StatCard icon={CreditCard} label="Abonnements actifs" value={String(revenue.activeSubscriptions)} />
        </div>
      </Section>

      <Section title="Évolution mensuelle" description="Tendance des revenus sur les 6 derniers mois.">
        <RevenueChart monthlyTrend={monthlyTrend} />
      </Section>

      <Section title="Répartition par plan" description="Nombre d'abonnés et tarif par plan.">
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Abonnés</TableHead>
                  <TableHead className="text-right">Part</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planStats.map((plan) => {
                  const totalSubs = planStats.reduce((s, p) => s + p.subscriberCount, 0);
                  const pct = totalSubs > 0 ? Math.round((plan.subscriberCount / totalSubs) * 100) : 0;
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {plan.name}
                          {plan.name === "Free" && <Badge variant="outline" className="text-xs">Gratuit</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.price === null ? "Sur devis" : plan.price === 0 ? "Gratuit" : formatCurrency(plan.price, plan.currency)}
                      </TableCell>
                      <TableCell>{plan.subscriberCount}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{pct}%</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
