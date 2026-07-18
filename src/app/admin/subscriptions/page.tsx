import type { Metadata } from "next";
import { AlertTriangle, CreditCard, Hourglass, XCircle } from "lucide-react";

import { listAllSubscriptions } from "@/lib/services/billing";
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abonnements</h1>
        <p className="text-sm text-muted-foreground">
          {subscriptions.length} abonnement{subscriptions.length !== 1 ? "s" : ""} sur la plateforme.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CreditCard} label="Actifs" value={String(active)} />
        <StatCard icon={Hourglass} label="À l'essai" value={String(trialing)} />
        <StatCard icon={AlertTriangle} label="Paiement en retard" value={String(pastDue)} muted={pastDue === 0} />
        <StatCard icon={XCircle} label="Annulés" value={String(canceled)} muted={canceled === 0} />
      </div>

      <DataTable
        columns={subscriptionsColumns}
        data={subscriptions}
        searchColumn="organization"
        searchPlaceholder="Rechercher une organisation..."
      />
    </div>
  );
}
