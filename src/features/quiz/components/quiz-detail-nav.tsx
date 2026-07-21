"use client";

import { useState } from "react";
import { HelpCircle, BarChart3, Users } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="flex flex-col gap-3 lg:flex-row lg:gap-8">
      {/* Mobile: tabs + settings button */}
      <nav className="flex flex-col gap-2 shrink-0 lg:hidden">
        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as QuizTab)}
        >
          <TabsList variant="line" className="w-full">
            {NAV_ITEMS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="gap-1 text-[13px]">
                <item.icon className="size-3.5 shrink-0" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {settingsTrigger}
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden shrink-0 lg:block lg:w-56">
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActive(item.value)}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all",
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
                  <p className="truncate text-[11px] text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
          {settingsTrigger}
        </div>
      </nav>

      <div className="min-w-0 flex-1">{content[active]}</div>
    </div>
  );
}
