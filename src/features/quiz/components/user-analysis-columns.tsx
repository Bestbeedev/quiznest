"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { UserAnalysisRow } from "@/lib/analytics";

export type UserAnalysisTableRow = UserAnalysisRow & { id: string };

export const userAnalysisColumns: ColumnDef<UserAnalysisTableRow>[] = [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        {row.original.email && <p className="text-xs text-muted-foreground">{row.original.email}</p>}
      </div>
    ),
  },
  {
    accessorKey: "quizzesTaken",
    header: "Quiz passés",
  },
  {
    accessorKey: "attempts",
    header: "Tentatives",
  },
  {
    accessorKey: "averageScore",
    header: "Score moyen",
    cell: ({ row }) => (row.original.averageScore === null ? "—" : `${row.original.averageScore}%`),
  },
  {
    accessorKey: "passRate",
    header: "Taux de réussite",
    cell: ({ row }) => (row.original.passRate === null ? "—" : `${row.original.passRate}%`),
  },
];
