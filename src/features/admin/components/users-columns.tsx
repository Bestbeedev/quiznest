"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { User, UserStatus } from "@/generated/prisma/client";

export type UserRow = User & { _count: { memberships: number } };

const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  BANNED: "Banni",
};

export const usersColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <Badge variant="secondary">{STATUS_LABELS[row.original.status]}</Badge>,
  },
  {
    id: "organizations",
    header: "Organisations",
    accessorFn: (row) => row._count.memberships,
  },
  {
    accessorKey: "isSuperAdmin",
    header: "Super admin",
    cell: ({ row }) => (row.original.isSuperAdmin ? <Badge>Oui</Badge> : null),
  },
  {
    accessorKey: "createdAt",
    header: "Inscrit le",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(row.original.createdAt),
  },
];
