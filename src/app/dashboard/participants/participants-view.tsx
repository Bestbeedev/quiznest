"use client";

import { DataTable } from "@/components/shared/data-table";
import {
  orgParticipantsColumns,
  type OrgParticipantRow,
} from "@/features/quiz/components/org-participants-columns";
import { OrgParticipantsToolbar } from "@/features/quiz/components/org-participants-toolbar";

export function ParticipantsView({ participants }: { participants: OrgParticipantRow[] }) {
  return (
    <DataTable
      columns={orgParticipantsColumns}
      data={participants}
      searchColumn="name"
      searchPlaceholder="Rechercher un participant..."
      enableColumnVisibility
      toolbar={(table) => <OrgParticipantsToolbar table={table} participants={participants} />}
    />
  );
}
