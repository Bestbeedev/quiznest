import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** The visual vocabulary the Feature Gate renders as, per Prompt-Archi.md
 * "UI": Inclus / Limité (N) / Illimité / Verrouillé. Keep every feature-gated
 * surface in the app speaking through this one component so the states stay
 * visually consistent. */
export function FeatureStatusBadge({
  enabled,
  limit,
  remaining,
}: {
  enabled: boolean;
  limit?: number | null;
  /** This calendar month's remaining quota — omit when usage isn't tracked
   * for this feature yet, the badge then falls back to the static cap. */
  remaining?: number | null;
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
    return (
      <Badge variant="secondary">
        {remaining != null ? `${remaining}/${limit} restant${remaining !== 1 ? "s" : ""}` : `Limité · ${limit}/mois`}
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
