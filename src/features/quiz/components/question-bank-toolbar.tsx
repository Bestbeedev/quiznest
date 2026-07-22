"use client";

import { useMemo } from "react";
import type { Table } from "@tanstack/react-table";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { QuestionBankRow } from "@/features/quiz/components/question-bank-columns";

const TYPE_OPTIONS = [
  { value: "SINGLE_CHOICE", label: "QCM" },
  { value: "MULTIPLE_CHOICE", label: "Choix multiple" },
  { value: "TRUE_FALSE", label: "Vrai / Faux" },
  { value: "SHORT_ANSWER", label: "Réponse courte" },
];

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Facile" },
  { value: "MEDIUM", label: "Moyen" },
  { value: "HARD", label: "Difficile" },
];

function FilterSelect({
  value,
  onChange,
  placeholder,
  allLabel,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  allLabel: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)} items={[{ value: "all", label: allLabel }, ...options]}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function QuestionBankToolbar({ table, questions }: { table: Table<QuestionBankRow>; questions: QuestionBankRow[] }) {
  const quizzes = useMemo(() => {
    const map = new Map(questions.map((q) => [q.quiz.id, q.quiz.title]));
    return Array.from(map, ([id, title]) => ({ value: id, label: title }));
  }, [questions]);

  const categories = useMemo(() => {
    const set = new Set(questions.map((q) => q.category).filter((c): c is string => !!c));
    return Array.from(set).map((c) => ({ value: c, label: c }));
  }, [questions]);

  const tags = useMemo(() => {
    const set = new Set(questions.flatMap((q) => q.tags));
    return Array.from(set).map((t) => ({ value: t, label: t }));
  }, [questions]);

  const getFilter = (columnId: string) => (table.getColumn(columnId)?.getFilterValue() as string) ?? "all";
  const setFilter = (columnId: string) => (value: string) =>
    table.getColumn(columnId)?.setFilterValue(value === "all" ? undefined : value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        value={getFilter("quiz")}
        onChange={setFilter("quiz")}
        placeholder="Quiz"
        allLabel="Tous les quiz"
        options={quizzes}
      />
      <FilterSelect
        value={getFilter("category")}
        onChange={setFilter("category")}
        placeholder="Catégorie"
        allLabel="Toutes catégories"
        options={categories}
      />
      <FilterSelect
        value={getFilter("difficulty")}
        onChange={setFilter("difficulty")}
        placeholder="Difficulté"
        allLabel="Toute difficulté"
        options={DIFFICULTY_OPTIONS}
      />
      <FilterSelect
        value={getFilter("type")}
        onChange={setFilter("type")}
        placeholder="Type"
        allLabel="Tous types"
        options={TYPE_OPTIONS}
      />
      {tags.length > 0 && (
        <FilterSelect
          value={getFilter("tags")}
          onChange={setFilter("tags")}
          placeholder="Tag"
          allLabel="Tous les tags"
          options={tags}
        />
      )}
    </div>
  );
}
