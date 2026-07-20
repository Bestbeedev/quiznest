import Link from "next/link";
import { Lock, ArrowUpRight, ShoppingCart, Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type FeatureCheckUI = {
  allowed: boolean;
  reason?: string;
  message?: string;
  limit?: number | null;
  used?: number;
  remaining?: number | null;
  cta?: "upgrade" | "pass" | "wallet" | "none";
};

export function FeatureLockNotice({
  label,
  reason,
  message,
  check,
}: {
  label: string;
  reason?: string;
  message?: string;
  check?: FeatureCheckUI;
}) {
  const displayMessage = message ?? reason;
  const cta = check?.cta ?? "upgrade";

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" disabled className="gap-1.5 text-muted-foreground" title={displayMessage}>
        <Lock className="size-3.5" />
        {label}
      </Button>

      {displayMessage && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription className="flex flex-col gap-2">
            <span>{displayMessage}</span>
            {check && check.limit != null && check.used != null && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {check.used}/{check.limit} utilisations ce mois-ci
                {check.remaining != null && check.remaining > 0
                  ? ` — ${check.remaining} restante(s)`
                  : " — quota épuisé"}
              </span>
            )}
            <div className="flex items-center gap-2">
              {(cta === "upgrade" || cta === "none") && (
                <Link
                  href="/dashboard/billing"
                  className={cn(buttonVariants({ variant: cta === "none" ? "outline" : "default", size: "sm" }), "h-7 gap-1 text-xs")}
                >
                  <ArrowUpRight className="size-3" />
                  Voir les plans
                </Link>
              )}
              {cta === "pass" && (
                <Link
                  href="/dashboard/passes"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-7 gap-1 text-xs")}
                >
                  <ShoppingCart className="size-3" />
                  Acheter un Pack
                </Link>
              )}
              {cta === "wallet" && (
                <Link
                  href="/dashboard/wallet"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-7 gap-1 text-xs")}
                >
                  <Wallet className="size-3" />
                  Acheter des crédits
                </Link>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
