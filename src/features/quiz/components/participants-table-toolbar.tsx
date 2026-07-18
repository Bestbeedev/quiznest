"use client";

import type { Table } from "@tanstack/react-table";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Participant } from "@/generated/prisma/client";

const STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ABANDONED", label: "Abandonné" },
];

export function ParticipantsTableToolbar({ table }: { table: Table<Participant> }) {
  const statusValue = (table.getColumn("status")?.getFilterValue() as string) ?? "all";

  return (
    <Select
      value={statusValue}
      onValueChange={(value) =>
        table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
      }
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue placeholder="Statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les statuts</SelectItem>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
