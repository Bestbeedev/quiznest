import type { Metadata } from "next";

import { listAllOrganizations } from "@/lib/services/admin";
import { DataTable } from "@/components/shared/data-table";
import { organizationsColumns } from "@/features/admin/components/organizations-columns";

export const metadata: Metadata = {
  title: "Organisations — Admin QuizNest",
};

export default async function AdminOrganizationsPage() {
  const organizations = await listAllOrganizations();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organisations</h1>
        <p className="text-sm text-muted-foreground">
          {organizations.length} organisation{organizations.length !== 1 ? "s" : ""} sur la plateforme.
        </p>
      </div>

      <DataTable
        columns={organizationsColumns}
        data={organizations}
        searchColumn="name"
        searchPlaceholder="Rechercher une organisation..."
      />
    </div>
  );
}
