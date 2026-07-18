"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { Plan, Subscription, SubscriptionStatus } from "@/generated/prisma/client";

export type SubscriptionRow = Subscription & {
  organization: { id: string; name: string; slug: string };
  plan: Plan;
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  TRIALING: "Essai",
  ACTIVE: "Actif",
  PAST_DUE: "Impayé",
  CANCELED: "Annulé",
};

const STATUS_VARIANTS: Record<SubscriptionStatus, "secondary" | "default" | "destructive"> = {
  TRIALING: "secondary",
  ACTIVE: "default",
  PAST_DUE: "destructive",
  CANCELED: "secondary",
};

export const subscriptionsColumns: ColumnDef<SubscriptionRow>[] = [
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
    id: "plan",
    header: "Plan",
    accessorFn: (row) => row.plan.name,
    cell: ({ row }) => <Badge variant="outline">{row.original.plan.name}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANTS[row.original.status]}>{STATUS_LABELS[row.original.status]}</Badge>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Débutée le",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(row.original.startDate),
  },
  {
    accessorKey: "autoRenew",
    header: "Renouvellement auto",
    cell: ({ row }) => (row.original.autoRenew ? "Oui" : "Non"),
  },
];
