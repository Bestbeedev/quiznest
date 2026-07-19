import type { Metadata } from "next";
import { CheckCircle2, TrendingUp, Wallet, XCircle } from "lucide-react";

import { listAllPayments } from "@/lib/services/billing";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { paymentsColumns } from "@/features/admin/components/payments-columns";

export const metadata: Metadata = {
  title: "Paiements — Admin QuizNest",
};

export default async function AdminPaymentsPage() {
  const payments = await listAllPayments();

  const succeeded = payments.filter((p) => p.status === "SUCCEEDED");
  const failed = payments.filter((p) => p.status === "FAILED").length;
  const totalRevenue = succeeded.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Paiements"
        subtitle={`${payments.length} paiement${payments.length !== 1 ? "s" : ""} enregistré${payments.length !== 1 ? "s" : ""}.`}
      />

      <Section title="Statistiques" description="Résumé des transactions financières.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Revenu total" value={formatCurrency(totalRevenue)} />
          <StatCard icon={TrendingUp} label="Paiements" value={String(payments.length)} />
          <StatCard icon={CheckCircle2} label="Réussis" value={String(succeeded.length)} />
          <StatCard icon={XCircle} label="Échoués" value={String(failed)} muted={failed === 0} />
        </div>
      </Section>

      <Section title="Tous les paiements" description="Historique complet des transactions.">
        <DataTable
          columns={paymentsColumns}
          data={payments}
          searchColumn="organization"
          searchPlaceholder="Rechercher une organisation..."
        />
      </Section>
    </div>
  );
}
