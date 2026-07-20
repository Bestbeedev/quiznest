import { Check, Lock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** The visual vocabulary the Feature Gate renders as — Inclus / Limité (N) / Illimité / Verrouillé / Quota atteint.
 * Keep every feature-gated surface in the app speaking through this one component. */
export function FeatureStatusBadge({
  enabled,
  limit,
  remaining,
  used,
}: {
  enabled: boolean;
  limit?: number | null;
  /** This calendar month's remaining quota — omit when usage isn't tracked
   * for this feature yet, the badge then falls back to the static cap. */
  remaining?: number | null;
  used?: number;
}) {
  if (!enabled) {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Lock className="size-3" />
        Verrouillé
      </Badge>
    );
  }

  if (limit != null) {
    const quotaExhausted = remaining != null && remaining <= 0;

    return (
      <Badge
        variant={quotaExhausted ? "destructive" : "secondary"}
        className={cn("gap-1", quotaExhausted && "border-destructive/50")}
      >
        {quotaExhausted ? (
          <>
            <AlertTriangle className="size-3" />
            Quota atteint ({used}/{limit})
          </>
        ) : remaining != null ? (
          `${remaining}/${limit} restant${remaining !== 1 ? "s" : ""}`
        ) : (
          `Limité · ${limit}/mois`
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1">
      <Check className="size-3" />
      Inclus
    </Badge>
  );
}
