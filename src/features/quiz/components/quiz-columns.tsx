"use client";

import Link from "next/link";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";

import { QuizStatusBadge } from "@/features/quiz/components/quiz-status-badge";
import { QuizRowActions } from "@/features/quiz/components/quiz-row-actions";
import type { Quiz } from "@/generated/prisma/client";

export type QuizRow = Quiz & { _count: { questions: number }; author: { id: string; name: string } };

export type DateRangeFilter = { from?: string; to?: string };

const dateRangeFilterFn: FilterFn<QuizRow> = (row, columnId, filterValue: DateRangeFilter) => {
  const value = row.getValue<Date>(columnId).getTime();
  if (filterValue.from && value < new Date(filterValue.from).getTime()) return false;
  if (filterValue.to) {
    const end = new Date(filterValue.to);
    end.setHours(23, 59, 59, 999);
    if (value > end.getTime()) return false;
  }
  return true;
};

export const quizColumns: ColumnDef<QuizRow>[] = [
  {
    accessorKey: "title",
    header: "Titre",
    cell: ({ row }) => (
      <Link href={`/dashboard/quiz/${row.original.id}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    filterFn: "equalsString",
    cell: ({ row }) => <QuizStatusBadge status={row.original.status} />,
  },
  {
    id: "author",
    header: "Auteur",
    accessorFn: (row) => row.author.name,
    filterFn: "equalsString",
  },
  {
    id: "questions",
    header: "Questions",
    accessorFn: (row) => row._count.questions,
  },
  {
    accessorKey: "attempts",
    header: "Tentatives",
  },
  {
    accessorKey: "createdAt",
    header: "Créé le",
    filterFn: dateRangeFilterFn,
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => <QuizRowActions quizId={row.original.id} status={row.original.status} />,
  },
];
