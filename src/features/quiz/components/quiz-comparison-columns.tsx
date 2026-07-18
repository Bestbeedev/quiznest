"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { formatDuration } from "@/lib/format";
import type { QuizComparisonRow } from "@/lib/analytics";

export type QuizComparisonTableRow = QuizComparisonRow & { id: string };

export const quizComparisonColumns: ColumnDef<QuizComparisonTableRow>[] = [
  {
    accessorKey: "title",
    header: "Quiz",
    cell: ({ row }) => (
      <Link href={`/dashboard/quiz/${row.original.quizId}`} className="font-medium hover:underline">
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "participants",
    header: "Participants",
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
  {
    accessorKey: "averageTime",
    header: "Temps moyen",
    cell: ({ row }) => (row.original.averageTime === null ? "—" : formatDuration(row.original.averageTime)),
  },
];
