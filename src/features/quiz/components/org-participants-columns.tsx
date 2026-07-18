"use client";

import Link from "next/link";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { ParticipantAnswersDialog } from "@/features/quiz/components/participant-answers-dialog";
import type { Participant, ParticipantStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<ParticipantStatus, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABANDONED: "Abandonné",
};

export type OrgParticipantRow = Participant & { quiz: { id: string; title: string } };

export type DateRangeFilter = { from?: string; to?: string };

const dateRangeFilterFn: FilterFn<OrgParticipantRow> = (row, columnId, filterValue: DateRangeFilter) => {
  const value = row.getValue<Date>(columnId).getTime();
  if (filterValue.from && value < new Date(filterValue.from).getTime()) return false;
  if (filterValue.to) {
    const end = new Date(filterValue.to);
    end.setHours(23, 59, 59, 999);
    if (value > end.getTime()) return false;
  }
  return true;
};

export const orgParticipantsColumns: ColumnDef<OrgParticipantRow>[] = [
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
    accessorKey: "status",
    header: "Statut",
    filterFn: "equalsString",
    cell: ({ row }) => <Badge variant="secondary">{STATUS_LABELS[row.original.status]}</Badge>,
  },
  {
    accessorKey: "percentage",
    header: "Score",
    cell: ({ row }) => (row.original.status === "COMPLETED" ? `${row.original.percentage}%` : "—"),
  },
  {
    accessorKey: "startedAt",
    header: "Démarré le",
    filterFn: dateRangeFilterFn,
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
        row.original.startedAt,
      ),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => (
      <ParticipantAnswersDialog
        quizId={row.original.quiz.id}
        participantId={row.original.id}
        participantName={row.original.name}
      />
    ),
  },
];
