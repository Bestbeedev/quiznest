"use client";

import { useMemo } from "react";
import type { Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QuizRow, DateRangeFilter } from "@/features/quiz/components/quiz-columns";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
  { value: "ARCHIVED", label: "Archivé" },
];

export function QuizTableToolbar({ table, quizzes }: { table: Table<QuizRow>; quizzes: QuizRow[] }) {
  const authors = useMemo(() => {
    const names = new Set(quizzes.map((q) => q.author.name));
    return Array.from(names).sort();
  }, [quizzes]);

  const statusValue = (table.getColumn("status")?.getFilterValue() as string) ?? "all";
  const authorValue = (table.getColumn("author")?.getFilterValue() as string) ?? "all";
  const dateValue = (table.getColumn("createdAt")?.getFilterValue() as DateRangeFilter) ?? {};

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      <Select
        value={authorValue}
        onValueChange={(value) =>
          table.getColumn("author")?.setFilterValue(value === "all" ? undefined : value)
        }
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Auteur" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les auteurs</SelectItem>
          {authors.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          aria-label="Créé depuis le"
          value={dateValue.from ?? ""}
          onChange={(e) =>
            table.getColumn("createdAt")?.setFilterValue({ ...dateValue, from: e.target.value || undefined })
          }
          className="w-36"
        />
        <span className="text-sm text-muted-foreground">à</span>
        <Input
          type="date"
          aria-label="Créé jusqu'au"
          value={dateValue.to ?? ""}
          onChange={(e) =>
            table.getColumn("createdAt")?.setFilterValue({ ...dateValue, to: e.target.value || undefined })
          }
          className="w-36"
        />
      </div>
    </div>
  );
}
