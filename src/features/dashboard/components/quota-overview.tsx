import Link from "next/link";
import {
  ListChecks,
  Users,
  Sparkles,
  Coins,
  ArrowRight,
  Infinity,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

type QuotaItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  used: number;
  limit: number | null;
  color: string;
  href: string;
  ctaLabel: string;
  /** Override remaining display (e.g. wallet credits) */
  overrideRemaining?: string;
};

function QuotaRow({ item }: { item: QuotaItem }) {
  const Icon = item.icon;
  const limit = item.limit;
  const unlimited = limit === null;
  const pct = unlimited ? 0 : Math.min(Math.round((item.used / limit) * 100), 100);
  const nearLimit = !unlimited && pct >= 80;
  const atLimit = !unlimited && item.used >= limit;
  const remaining = unlimited ? null : Math.max(limit - item.used, 0);

  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border p-3.5 transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              item.color,
            )}
          >
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            atLimit
              ? "text-destructive"
              : nearLimit
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground",
          )}
        >
            {item.overrideRemaining
            ? item.overrideRemaining
            : unlimited
              ? `${item.used} · Illimité`
              : `${item.used} / ${limit}`}
        </span>
      </div>

      {!unlimited && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              atLimit
                ? "bg-destructive"
                : nearLimit
                  ? "bg-amber-500"
                  : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {unlimited ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Infinity className="size-3" />
            Illimité
          </span>
        ) : (
          <span
            className={cn(
              "text-xs",
              atLimit
                ? "font-medium text-destructive"
                : nearLimit
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground",
            )}
          >
            {remaining} restant{remaining !== 1 ? "s" : ""}
          </span>
        )}
        <Link
          href={item.href}
          className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
        >
          {item.ctaLabel}
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export function QuotaOverview({
  quizUsed,
  quizLimit,
  participantUsed,
  participantLimit,
  aiUsed,
  aiLimit,
  aiLabel,
  walletBalance,
}: {
  quizUsed: number;
  quizLimit: number | null;
  participantUsed: number;
  participantLimit: number | null;
  aiUsed: number;
  aiLimit: number | null;
  aiLabel: string;
  walletBalance: number;
}) {
  const items: QuotaItem[] = [
    {
      icon: ListChecks,
      label: "Quiz",
      used: quizUsed,
      limit: quizLimit,
      color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      href: "/dashboard/quiz",
      ctaLabel: "Créer",
    },
    {
      icon: Users,
      label: "Participants",
      used: participantUsed,
      limit: participantLimit,
      color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      href: "/dashboard/participants",
      ctaLabel: "Voir",
    },
    {
      icon: Sparkles,
      label: "Générations IA",
      used: aiUsed,
      limit: aiLimit,
      color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
      href: "/dashboard/ai",
      ctaLabel: aiLimit === null ? "Utiliser" : "Générer",
    },
    {
      icon: Coins,
      label: "Crédits wallet",
      used: walletBalance,
      limit: null,
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      href: "/dashboard/wallet",
      ctaLabel: "Recharger",
      overrideRemaining:
        walletBalance > 0
          ? `${walletBalance} crédit${walletBalance !== 1 ? "s" : ""}`
          : "Vide",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Quotas du mois</CardTitle>
        <span className="text-[11px] text-muted-foreground">{aiLabel}</span>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <QuotaRow key={item.label} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
