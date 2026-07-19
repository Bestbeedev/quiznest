"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionStat = {
  id: string;
  title: string;
  order: number;
  difficulty: string;
  category: string | null;
  successRate: number | null;
};

const DIFFICULTY_CONFIG = {
  HARD: { label: "Difficiles", color: "bg-destructive/10 text-destructive border-destructive/20", heatBg: "bg-destructive", order: 0 },
  MEDIUM: { label: "Moyennes", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", heatBg: "bg-amber-500/70", order: 1 },
  EASY: { label: "Faciles", color: "bg-primary/10 text-primary border-primary/20", heatBg: "bg-primary", order: 2 },
} as const;

const GROUP_PAGE_SIZE = 10;

function heatColor(rate: number | null) {
  if (rate === null) return "bg-muted text-muted-foreground";
  if (rate >= 80) return "bg-primary text-primary-foreground";
  if (rate >= 60) return "bg-primary/70 text-primary-foreground";
  if (rate >= 40) return "bg-amber-500/70 text-white";
  if (rate >= 20) return "bg-destructive/60 text-white";
  return "bg-destructive text-white";
}

function heatColorCompact(rate: number | null) {
  if (rate === null) return "bg-muted";
  if (rate >= 80) return "bg-primary";
  if (rate >= 60) return "bg-primary/70";
  if (rate >= 40) return "bg-amber-500/70";
  if (rate >= 20) return "bg-destructive/60";
  return "bg-destructive";
}

function groupByDifficulty(questions: QuestionStat[]) {
  const groups: Record<string, QuestionStat[]> = { HARD: [], MEDIUM: [], EASY: [] };
  for (const q of questions) {
    const key = q.difficulty in DIFFICULTY_CONFIG ? q.difficulty : "MEDIUM";
    groups[key].push(q);
  }
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .sort(([a], [b]) => (DIFFICULTY_CONFIG[a as keyof typeof DIFFICULTY_CONFIG]?.order ?? 99) - (DIFFICULTY_CONFIG[b as keyof typeof DIFFICULTY_CONFIG]?.order ?? 99));
}

export function QuestionAnalysis({ questionStats }: { questionStats: QuestionStat[] }) {
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState<Record<string, boolean>>({});
  const [groupPage, setGroupPage] = useState<Record<string, number>>({});

  const groups = groupByDifficulty(questionStats);

  const toggleGroup = (key: string) => setGroupsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const getGroupPage = (key: string) => groupPage[key] ?? 0;
  const setGroupPageFn = (key: string, page: number) => setGroupPage((prev) => ({ ...prev, [key]: page }));

  if (questionStats.length === 0) return null;

  const totalHard = questionStats.filter((q) => q.difficulty === "HARD").length;
  const totalMedium = questionStats.filter((q) => q.difficulty === "MEDIUM").length;
  const totalEasy = questionStats.filter((q) => q.difficulty === "EASY").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Heatmap compact */}
      <Card>
        <CardHeader className="cursor-pointer select-none" onClick={() => setHeatmapOpen(!heatmapOpen)}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">Heatmap des questions</CardTitle>
              <p className="text-xs text-muted-foreground">
                {totalHard} difficiles · {totalMedium} moyennes · {totalEasy} faciles
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
              {heatmapOpen ? <ChevronDown className="size-4 rotate-180" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </CardHeader>
        {heatmapOpen && (
          <CardContent>
            <div className="max-h-56 overflow-y-auto rounded-lg border p-3">
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-10">
                {questionStats.map((question, index) => (
                  <div
                    key={question.id}
                    title={`Q${question.order + 1} — ${question.title}\n${question.successRate === null ? "aucune donnée" : `${question.successRate}%`}`}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl py-6 text-xs font-semibold",
                      heatColor(question.successRate),
                    )}
                  >
                    <span>Q{question.order + 1}</span>
                    <span className="text-[10px] font-normal opacity-90">
                      {question.successRate === null ? "—" : `${question.successRate}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Per-question breakdown grouped by difficulty */}
      {groups.map(([diffKey, questions]) => {
        const config = DIFFICULTY_CONFIG[diffKey as keyof typeof DIFFICULTY_CONFIG];
        if (!config) return null;
        const isOpen = groupsOpen[diffKey] ?? false;
        const page = getGroupPage(diffKey);
        const totalPages = Math.ceil(questions.length / GROUP_PAGE_SIZE);
        const paged = questions.slice(page * GROUP_PAGE_SIZE, (page + 1) * GROUP_PAGE_SIZE);

        return (
          <Card key={diffKey}>
            <CardHeader className="cursor-pointer select-none py-3" onClick={() => toggleGroup(diffKey)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={cn("size-2.5 rounded-full", config.heatBg)} />
                  <div className="min-w-0">
                    <CardTitle className="text-sm">{config.label}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {questions.length} question{questions.length !== 1 ? "s" : ""}
                      {isOpen && totalPages > 1 && ` — page ${page + 1}/${totalPages}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {questions.length}
                  </Badge>
                  <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
                    {isOpen ? <ChevronDown className="size-3.5 rotate-180" /> : <ChevronDown className="size-3.5" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isOpen && (
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2.5">
                  {paged.map((question) => (
                    <div key={question.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="min-w-0 truncate font-medium">
                          <span className="text-muted-foreground">Q{question.order + 1}</span> {question.title}
                        </span>
                        <span className="shrink-0 pl-2 text-muted-foreground">
                          {question.successRate === null ? "—" : `${question.successRate}%`}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all", heatColorCompact(question.successRate))}
                          style={{ width: `${question.successRate ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={(e) => { e.stopPropagation(); setGroupPageFn(diffKey, page - 1); }}
                    >
                      <ChevronLeft className="size-3.5" />
                      Précédent
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {page * GROUP_PAGE_SIZE + 1}–{Math.min((page + 1) * GROUP_PAGE_SIZE, questions.length)} sur{" "}
                      {questions.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={(e) => { e.stopPropagation(); setGroupPageFn(diffKey, page + 1); }}
                    >
                      Suivant
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
