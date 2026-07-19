import type { Metadata } from "next";
import { AlertTriangle, CreditCard, Hourglass, XCircle } from "lucide-react";

import { listAllSubscriptions } from "@/lib/services/billing";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { subscriptionsColumns } from "@/features/admin/components/subscriptions-columns";

export const metadata: Metadata = {
  title: "Abonnements — Admin QuizNest",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listAllSubscriptions();

  const active = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialing = subscriptions.filter((s) => s.status === "TRIALING").length;
  const pastDue = subscriptions.filter((s) => s.status === "PAST_DUE").length;
  const canceled = subscriptions.filter((s) => s.status === "CANCELED").length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Abonnements"
        subtitle={`${subscriptions.length} abonnement${subscriptions.length !== 1 ? "s" : ""} sur la plateforme.`}
      />

      <Section title="Statistiques" description="État des abonnements de la plateforme.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CreditCard} label="Actifs" value={String(active)} />
          <StatCard icon={Hourglass} label="À l'essai" value={String(trialing)} />
          <StatCard icon={AlertTriangle} label="Paiement en retard" value={String(pastDue)} muted={pastDue === 0} />
          <StatCard icon={XCircle} label="Annulés" value={String(canceled)} muted={canceled === 0} />
        </div>
      </Section>

      <Section title="Tous les abonnements" description="Suivi de l'état de chaque abonnement.">
        <DataTable
          columns={subscriptionsColumns}
          data={subscriptions}
          searchColumn="organization"
          searchPlaceholder="Rechercher une organisation..."
        />
      </Section>
    </div>
  );
}
