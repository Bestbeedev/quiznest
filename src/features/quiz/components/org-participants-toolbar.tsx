"use client";

import { useMemo } from "react";
import type { Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrgParticipantRow, DateRangeFilter } from "@/features/quiz/components/org-participants-columns";

const STATUS_OPTIONS = [
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ABANDONED", label: "Abandonné" },
];

export function OrgParticipantsToolbar({
  table,
  participants,
}: {
  table: Table<OrgParticipantRow>;
  participants: OrgParticipantRow[];
}) {
  const quizzes = useMemo(() => {
    const map = new Map(participants.map((p) => [p.quiz.id, p.quiz.title]));
    return Array.from(map, ([id, title]) => ({ value: id, label: title }));
  }, [participants]);

  const quizValue = (table.getColumn("quiz")?.getFilterValue() as string) ?? "all";
  const statusValue = (table.getColumn("status")?.getFilterValue() as string) ?? "all";
  const dateValue = (table.getColumn("startedAt")?.getFilterValue() as DateRangeFilter) ?? {};

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={quizValue}
        onValueChange={(v) => table.getColumn("quiz")?.setFilterValue(v === "all" ? undefined : v)}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Quiz" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les quiz</SelectItem>
          {quizzes.map((quiz) => (
            <SelectItem key={quiz.value} value={quiz.value}>
              {quiz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={statusValue}
        onValueChange={(v) => table.getColumn("status")?.setFilterValue(v === "all" ? undefined : v)}
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

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          aria-label="Démarré depuis le"
          value={dateValue.from ?? ""}
          onChange={(e) =>
            table.getColumn("startedAt")?.setFilterValue({ ...dateValue, from: e.target.value || undefined })
          }
          className="w-36"
        />
        <span className="text-sm text-muted-foreground">à</span>
        <Input
          type="date"
          aria-label="Démarré jusqu'au"
          value={dateValue.to ?? ""}
          onChange={(e) =>
            table.getColumn("startedAt")?.setFilterValue({ ...dateValue, to: e.target.value || undefined })
          }
          className="w-36"
        />
      </div>
    </div>
  );
}
