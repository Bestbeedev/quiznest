import type { Metadata } from "next";
import { buildMetadata } from "@/constants/seo";
import { Building2, ListChecks, TrendingUp, Users } from "lucide-react";

import { listAllOrganizations } from "@/lib/services/admin";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { organizationsColumns } from "@/features/admin/components/organizations-columns";

export const metadata: Metadata = buildMetadata({
  title: "Organisations",
  description: "Gestion des organisations : listes, membres et statistiques.",
  path: "/admin/organizations",
  noindex: true,
});

export default async function AdminOrganizationsPage() {
  const organizations = await listAllOrganizations();

  const totalMembers = organizations.reduce((sum, org) => sum + org._count.members, 0);
  const totalQuizzes = organizations.reduce((sum, org) => sum + org._count.quizzes, 0);
  const paidPlans = organizations.filter((org) => org.subscription?.plan.name !== "Free").length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Organisations"
        subtitle={`${organizations.length} organisation${organizations.length !== 1 ? "s" : ""} sur la plateforme.`}
      />

      <Section title="Statistiques" description="Vue d'ensemble des organisations.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Building2} label="Organisations" value={String(organizations.length)} />
          <StatCard icon={Users} label="Membres au total" value={String(totalMembers)} />
          <StatCard icon={ListChecks} label="Quiz au total" value={String(totalQuizzes)} />
          <StatCard icon={TrendingUp} label="Sur un plan payant" value={String(paidPlans)} />
        </div>
      </Section>

      <Section title="Toutes les organisations" description="Liste complète des organisations enregistrées.">
        <DataTable
          columns={organizationsColumns}
          data={organizations}
          searchColumn="name"
          searchPlaceholder="Rechercher une organisation..."
        />
      </Section>
    </div>
  );
}
