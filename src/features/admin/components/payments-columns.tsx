"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Payment, PaymentStatus } from "@/generated/prisma/client";

export type PaymentRow = Payment & {
  organization: { id: string; name: string; slug: string };
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

const STATUS_VARIANTS: Record<PaymentStatus, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING: "secondary",
  SUCCEEDED: "default",
  FAILED: "destructive",
  REFUNDED: "outline",
};

export const paymentsColumns: ColumnDef<PaymentRow>[] = [
  {
    id: "organization",
    header: "Organisation",
    accessorFn: (row) => row.organization.name,
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.organization.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.organization.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Montant",
    cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
  },
  {
    accessorKey: "provider",
    header: "Fournisseur",
    cell: ({ row }) => row.original.provider ?? "—",
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANTS[row.original.status]}>{STATUS_LABELS[row.original.status]}</Badge>
    ),
  },
  {
    accessorKey: "reference",
    header: "Référence",
    cell: ({ row }) => row.original.reference ?? "—",
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
