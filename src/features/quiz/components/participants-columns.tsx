"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { ParticipantAnswersDialog } from "@/features/quiz/components/participant-answers-dialog";
import { PARTICIPANT_STATUS_LABELS } from "@/lib/constants";
import type { Participant, ParticipantStatus } from "@/generated/prisma/client";

export const participantsColumns: ColumnDef<Participant>[] = [
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
    accessorKey: "status",
    header: "Statut",
    filterFn: "equalsString",
    cell: ({ row }) => <Badge variant="secondary">{PARTICIPANT_STATUS_LABELS[row.original.status]}</Badge>,
  },
  {
    accessorKey: "percentage",
    header: "Score",
    cell: ({ row }) =>
      row.original.status === "COMPLETED" ? `${row.original.percentage}%` : "—",
  },
  {
    accessorKey: "passed",
    header: "Résultat",
    cell: ({ row }) =>
      row.original.status === "COMPLETED" ? (
        <Badge variant={row.original.passed ? "default" : "outline"}>
          {row.original.passed ? "Réussi" : "Échoué"}
        </Badge>
      ) : (
        "—"
      ),
  },
  {
    accessorKey: "startedAt",
    header: "Démarré le",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
        row.original.startedAt,
      ),
  },
];

/** Adds the per-participant "detail" action, which needs `quizId` from the
 * page — kept out of the static `participantsColumns` array since that has
 * no access to it. */
export function buildParticipantsColumns(quizId: string): ColumnDef<Participant>[] {
  return [
    ...participantsColumns,
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) =>
        row.original.status === "COMPLETED" ? (
          <ParticipantAnswersDialog
            quizId={quizId}
            participantId={row.original.id}
            participantName={row.original.name}
          />
        ) : null,
    },
  ];
}
