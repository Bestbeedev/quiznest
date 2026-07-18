import type { Metadata } from "next";

import { listAuditLogs } from "@/lib/services/audit-log";
import { DataTable } from "@/components/shared/data-table";
import { logsColumns } from "@/features/admin/components/logs-columns";

export const metadata: Metadata = {
  title: "Logs — Admin QuizNest",
};

export default async function AdminLogsPage() {
  const logs = await listAuditLogs();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Logs d&apos;audit</h1>
        <p className="text-sm text-muted-foreground">
          Les {logs.length} dernières actions enregistrées sur la plateforme.
        </p>
      </div>

      <DataTable
        columns={logsColumns}
        data={logs}
        searchColumn="action"
        searchPlaceholder="Rechercher une action..."
      />
    </div>
  );
}
