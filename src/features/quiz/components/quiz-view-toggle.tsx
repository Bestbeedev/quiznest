"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizView } from "./quiz-view-context";

export function QuizViewToggle() {
  const { view, setView } = useQuizView();

  return (
    <div className="flex items-center rounded-lg border p-0.5">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => setView("grid")}
        aria-label="Vue grille"
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => setView("list")}
        aria-label="Vue liste"
      >
        <List className="size-4" />
      </Button>
    </div>
  );
}
