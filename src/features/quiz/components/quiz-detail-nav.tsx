"use client";

import { useState } from "react";
import { HelpCircle, BarChart3, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { value: "questions", label: "Questions", icon: HelpCircle, description: "Créer et gérer les questions" },
  { value: "participants", label: "Participants", icon: Users, description: "Suivre les réponses" },
  { value: "results", label: "Résultats", icon: BarChart3, description: "Statistiques et analyses" },
] as const;

type QuizTab = (typeof NAV_ITEMS)[number]["value"];

interface QuizDetailNavProps {
  questions: React.ReactNode;
  participants: React.ReactNode;
  results: React.ReactNode;
  settingsTrigger: React.ReactNode;
}

export function QuizDetailNav({ questions, participants, results, settingsTrigger }: QuizDetailNavProps) {
  const [active, setActive] = useState<QuizTab>("questions");

  const content: Record<QuizTab, React.ReactNode> = {
    questions,
    participants,
    results,
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="shrink-0 lg:w-56">
        <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActive(item.value)}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all shrink-0 sm:shrink sm:w-auto",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p className={cn("truncate", isActive && "text-primary")}>{item.label}</p>
                  <p className="hidden truncate text-[11px] text-muted-foreground lg:block">{item.description}</p>
                </div>
              </button>
            );
          })}
          <div key="settings">{settingsTrigger}</div>
        </div>
      </nav>

      <div className="min-w-0 flex-1">{content[active]}</div>
    </div>
  );
}
