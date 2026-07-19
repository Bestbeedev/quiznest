import type { Metadata } from "next";
import { ShieldCheck, UserPlus, Users, UsersRound } from "lucide-react";

import { listAllUsers } from "@/lib/services/admin";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { usersColumns } from "@/features/admin/components/users-columns";

export const metadata: Metadata = {
  title: "Utilisateurs — Admin QuizNest",
};

export default async function AdminUsersPage() {
  const users = await listAllUsers();

  const superAdmins = users.filter((u) => u.isSuperAdmin).length;
  const withoutOrg = users.filter((u) => u._count.memberships === 0).length;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = users.filter((u) => u.createdAt >= startOfMonth).length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Utilisateurs"
        subtitle={`${users.length} utilisateur${users.length !== 1 ? "s" : ""} sur la plateforme.`}
      />

      <Section title="Statistiques" description="Vue d'ensemble des utilisateurs.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Utilisateurs" value={String(users.length)} />
          <StatCard icon={UserPlus} label="Nouveaux ce mois-ci" value={String(newThisMonth)} />
          <StatCard icon={ShieldCheck} label="Super admins" value={String(superAdmins)} />
          <StatCard icon={UsersRound} label="Sans organisation" value={String(withoutOrg)} />
        </div>
      </Section>

      <Section title="Tous les utilisateurs" description="Liste complète des comptes utilisateurs.">
        <DataTable
          columns={usersColumns}
          data={users}
          searchColumn="name"
          searchPlaceholder="Rechercher un utilisateur..."
        />
      </Section>
    </div>
  );
}
