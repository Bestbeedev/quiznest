import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

import { listAuditLogs } from "@/lib/services/audit-log";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { logsColumns } from "@/features/admin/components/logs-columns";

export const metadata: Metadata = {
  title: "Logs — Admin QuizNest",
};

export default async function AdminLogsPage() {
  const logs = await listAuditLogs();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Logs d'audit"
        subtitle={`${logs.length} action${logs.length !== 1 ? "s" : ""} enregistrée${logs.length !== 1 ? "s" : ""} sur la plateforme.`}
      />

      <Section title="Statistiques" description="Résumé des logs d'audit.">
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
          <StatCard icon={ScrollText} label="Total des actions" value={String(logs.length)} />
        </div>
      </Section>

      <Section title="Journal d'audit" description="Historique chronologique de toutes les actions.">
        <DataTable
          columns={logsColumns}
          data={logs}
          searchColumn="action"
          searchPlaceholder="Rechercher une action..."
        />
      </Section>
    </div>
  );
}
