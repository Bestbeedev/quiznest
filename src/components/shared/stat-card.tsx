import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  muted,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
  /** Only rendered when the caller has a real, computable comparison — never
   * fabricated when there's no historical baseline to compare against. */
  trend?: { direction: "up" | "down"; value: string; comparisonLabel: string };
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-primary/10">
            <Icon className="size-3.5 text-primary" />
          </div>
          <p className="truncate text-[13px] text-muted-foreground">{label}</p>
        </div>

        <p className={cn("text-xl sm:text-2xl font-bold tracking-tight", muted && "text-muted-foreground")}>{value}</p>

        {trend ? (
          <p className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                trend.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {trend.value}
            </span>
            <span className="text-muted-foreground">{trend.comparisonLabel}</span>
          </p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
