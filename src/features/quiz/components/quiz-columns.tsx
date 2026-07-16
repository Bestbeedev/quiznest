"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { QuizStatusBadge } from "@/features/quiz/components/quiz-status-badge";
import { QuizRowActions } from "@/features/quiz/components/quiz-row-actions";
import type { Quiz } from "@/generated/prisma/client";

export type QuizRow = Quiz & { _count: { questions: number } };

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
    cell: ({ row }) => <QuizStatusBadge status={row.original.status} />,
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
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(row.original.createdAt),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <QuizRowActions quizId={row.original.id} status={row.original.status} />,
  },
];
