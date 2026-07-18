"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";

import { DataTable } from "@/components/shared/data-table";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { buildParticipantsColumns } from "@/features/quiz/components/participants-columns";
import { ParticipantsTableToolbar } from "@/features/quiz/components/participants-table-toolbar";
import type { Participant } from "@/generated/prisma/client";

export function ParticipantsTab({ quizId, participants }: { quizId: string; participants: Participant[] }) {
  const columns = useMemo(() => buildParticipantsColumns(quizId), [quizId]);

  if (participants.length === 0) {
    return (
      <EmptyStateCard
        icon={Users}
        title="Aucun participant"
        description="Partagez le lien public ou le QR code de ce quiz pour recevoir vos premières réponses."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={participants}
      searchColumn="name"
      searchPlaceholder="Rechercher un participant..."
      enableColumnVisibility
      toolbar={(table) => <ParticipantsTableToolbar table={table} />}
    />
  );
}
