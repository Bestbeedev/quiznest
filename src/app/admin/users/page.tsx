import type { Metadata } from "next";

import { listAllUsers } from "@/lib/services/admin";
import { DataTable } from "@/components/shared/data-table";
import { usersColumns } from "@/features/admin/components/users-columns";

export const metadata: Metadata = {
  title: "Utilisateurs — Admin QuizNest",
};

export default async function AdminUsersPage() {
  const users = await listAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} utilisateur{users.length !== 1 ? "s" : ""} sur la plateforme.
        </p>
      </div>

      <DataTable
        columns={usersColumns}
        data={users}
        searchColumn="name"
        searchPlaceholder="Rechercher un utilisateur..."
      />
    </div>
  );
}
