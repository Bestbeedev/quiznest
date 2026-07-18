"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import { QuestionPreviewDialog } from "@/features/quiz/components/question-preview-dialog";
import { QuestionBankRowActions } from "@/features/quiz/components/question-bank-row-actions";
import { QUESTION_DRAG_MIME } from "@/features/quiz/components/question-bank-drop-zone";
import type { Question, QuestionChoice } from "@/generated/prisma/client";

export type QuestionBankRow = Question & {
  quiz: { id: string; title: string };
  choices: QuestionChoice[];
  successRate: number | null;
  averageTimeSpent: number | null;
  answeredCount: number;
};

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

/** The edit form only supports these — SHORT_ANSWER is a valid enum value
 * but was never actually reachable through any creation UI. */
const EDITABLE_TYPES = new Set<Question["type"]>(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]);

/** Built as a function (not a static array) because the actions/preview cells
 * need the full list of quizzes for the "move/duplicate to..." menus, which
 * only the page knows. */
export function buildQuestionBankColumns(
  allQuizzes: { id: string; title: string }[],
): ColumnDef<QuestionBankRow>[] {
  return [
    {
      id: "drag",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <span
          draggable
          onDragStart={(e) => e.dataTransfer.setData(QUESTION_DRAG_MIME, row.original.id)}
          className="cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="Glisser pour déplacer"
        >
          <GripVertical className="size-4" />
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Question",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      id: "quiz",
      header: "Quiz",
      accessorFn: (row) => row.quiz.id,
      filterFn: "equalsString",
      cell: ({ row }) => (
        <Link href={`/dashboard/quiz/${row.original.quiz.id}`} className="hover:underline">
          {row.original.quiz.title}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "Catégorie",
      filterFn: "equalsString",
      cell: ({ row }) => row.original.category ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "tags",
      header: "Tags",
      filterFn: (row, columnId, filterValue: string) => (row.getValue<string[]>(columnId) ?? []).includes(filterValue),
      cell: ({ row }) =>
        row.original.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "type",
      header: "Type",
      filterFn: "equalsString",
      cell: ({ row }) => <Badge variant="secondary">{TYPE_LABELS[row.original.type]}</Badge>,
    },
    {
      accessorKey: "difficulty",
      header: "Difficulté",
      filterFn: "equalsString",
      cell: ({ row }) => <Badge variant="outline">{DIFFICULTY_LABELS[row.original.difficulty]}</Badge>,
    },
    {
      accessorKey: "points",
      header: "Points",
    },
    {
      accessorKey: "successRate",
      header: "Réussite",
      cell: ({ row }) =>
        row.original.successRate === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          `${row.original.successRate}%`
        ),
    },
    {
      accessorKey: "averageTimeSpent",
      header: "Temps moyen",
      cell: ({ row }) =>
        row.original.averageTimeSpent === null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          formatDuration(row.original.averageTimeSpent)
        ),
    },
    {
      id: "preview",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <QuestionPreviewDialog
          question={{
            title: row.original.title,
            points: row.original.points,
            explanation: row.original.explanation,
            choices: row.original.choices,
          }}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const q = row.original;
        const editableQuestion = EDITABLE_TYPES.has(q.type)
          ? {
              id: q.id,
              title: q.title,
              type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE",
              points: q.points,
              explanation: q.explanation,
              category: q.category,
              tags: q.tags,
              choices: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })),
            }
          : null;

        return (
          <QuestionBankRowActions
            questionId={q.id}
            quizId={q.quiz.id}
            editableQuestion={editableQuestion}
            otherQuizzes={allQuizzes.filter((quiz) => quiz.id !== q.quiz.id)}
          />
        );
      },
    },
  ];
}
