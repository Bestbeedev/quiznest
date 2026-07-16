"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { Question } from "@/generated/prisma/client";

export type QuestionBankRow = Question & { quiz: { id: string; title: string } };

const TYPE_LABELS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "QCM",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

const DIFFICULTY_LABELS: Record<Question["difficulty"], string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

export const questionBankColumns: ColumnDef<QuestionBankRow>[] = [
  {
    accessorKey: "title",
    header: "Question",
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    id: "quiz",
    header: "Quiz",
    accessorFn: (row) => row.quiz.title,
    cell: ({ row }) => (
      <Link href={`/dashboard/quiz/${row.original.quiz.id}`} className="hover:underline">
        {row.original.quiz.title}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <Badge variant="secondary">{TYPE_LABELS[row.original.type]}</Badge>,
  },
  {
    accessorKey: "difficulty",
    header: "Difficulté",
    cell: ({ row }) => <Badge variant="outline">{DIFFICULTY_LABELS[row.original.difficulty]}</Badge>,
  },
  {
    accessorKey: "points",
    header: "Points",
  },
];
