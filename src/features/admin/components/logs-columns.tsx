"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { AuditAction, AuditLog } from "@/generated/prisma/client";

export type LogRow = AuditLog & {
  organization: { id: string; name: string } | null;
  user: { id: string; name: string; email: string } | null;
};

const ACTION_LABELS: Record<AuditAction, string> = {
  ORGANIZATION_CREATED: "Organisation créée",
  QUIZ_CREATED: "Quiz créé",
  QUIZ_PUBLISHED: "Quiz publié",
  QUIZ_ARCHIVED: "Quiz archivé",
  QUIZ_DUPLICATED: "Quiz dupliqué",
  QUIZ_DELETED: "Quiz supprimé",
  PLATFORM_SETTINGS_UPDATED: "Paramètres plateforme modifiés",
  PAYMENT_SUCCEEDED: "Paiement réussi",
  SUBSCRIPTION_UPGRADED: "Abonnement mis à niveau",
};

export const logsColumns: ColumnDef<LogRow>[] = [
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <Badge variant="outline">{ACTION_LABELS[row.original.action]}</Badge>,
  },
  {
    id: "user",
    header: "Utilisateur",
    accessorFn: (row) => row.user?.name ?? "",
    cell: ({ row }) =>
      row.original.user ? (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
        </div>
      ) : (
        <span className="text-muted-foreground">Système</span>
      ),
  },
  {
    id: "organization",
    header: "Organisation",
    accessorFn: (row) => row.organization?.name ?? "",
    cell: ({ row }) => row.original.organization?.name ?? <span className="text-muted-foreground">—</span>,
  },
  {
    id: "resource",
    header: "Détails",
    cell: ({ row }) =>
      row.original.resource ? (
        <span className="block max-w-64 truncate text-xs text-muted-foreground">
          {JSON.stringify(row.original.resource)}
        </span>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
        row.original.createdAt,
      ),
  },
];
