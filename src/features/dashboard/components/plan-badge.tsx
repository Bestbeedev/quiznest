"use client";

import Link from "next/link";
import { ArrowUpRight, Crown, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  planName: string | null;
  collapsed?: boolean;
}

export function PlanBadge({ planName, collapsed }: PlanBadgeProps) {
  const name = planName ?? "Free";
  const isFree = name === "Free";

  if (collapsed) {
    return (
      <Link
        href="/dashboard/billing"
        className={cn(
          "flex size-9 items-center justify-center rounded-lg transition-colors",
          isFree
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400",
        )}
        title={isFree ? "Plan Free — Passer au Professional" : `Plan ${name}`}
      >
        {isFree ? <Sparkles className="size-4" /> : <Crown className="size-4" />}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-md",
          isFree ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        )}
      >
        {isFree ? <Sparkles className="size-3.5" /> : <Crown className="size-3.5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-none">Plan {name}</p>
        {isFree && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">Fonctionnalités limitées</p>
        )}
      </div>
      {isFree && (
        <Link
          href="/dashboard/billing"
          className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
          title="Passer au Professional"
        >
          <ArrowUpRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
