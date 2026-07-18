"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { Organization, OrganizationStatus } from "@/generated/prisma/client";

export type OrganizationRow = Organization & {
  _count: { members: number; quizzes: number };
  subscription: { plan: { name: string } } | null;
};

const STATUS_LABELS: Record<OrganizationStatus, string> = {
  TRIAL: "Essai",
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
};

export const organizationsColumns: ColumnDef<OrganizationRow>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge variant="secondary">{STATUS_LABELS[row.original.status]}</Badge>,
  },
  {
    id: "members",
    header: "Membres",
    accessorFn: (row) => row._count.members,
  },
  {
    id: "quizzes",
    header: "Quiz",
    accessorFn: (row) => row._count.quizzes,
  },
  {
    id: "plan",
    header: "Plan",
    accessorFn: (row) => row.subscription?.plan.name ?? "—",
    cell: ({ row }) =>
      row.original.subscription ? (
        <Badge variant="outline">{row.original.subscription.plan.name}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Créée le",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(row.original.createdAt),
  },
];
