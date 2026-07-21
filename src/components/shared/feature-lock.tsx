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
    <div className="flex flex-col gap-1.5">
      <Button variant="outline" disabled size="sm" className="h-8 w-full gap-1.5 text-[13px]" title={displayMessage}>
        <Lock className="size-3.5" />
        {label}
      </Button>

      {displayMessage && (
        <Alert variant="destructive" className="py-1.5 px-2 text-[11px]">
          <AlertDescription className="flex flex-col gap-1.5 text-[11px]">
            <span className="leading-snug">{displayMessage}</span>
            {check && check.limit != null && check.used != null && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {check.used}/{check.limit} utilisations ce mois-ci
                {check.remaining != null && check.remaining > 0
                  ? ` — ${check.remaining} restante(s)`
                  : " — quota épuisé"}
              </span>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              {(cta === "upgrade" || cta === "none") && (
                <Link
                  href="/dashboard/billing"
                  className={cn(buttonVariants({ variant: cta === "none" ? "outline" : "default", size: "sm" }), "h-6 gap-1 text-[10px] px-1.5")}
                >
                  <ArrowUpRight className="size-2.5" />
                  Voir les plans
                </Link>
              )}
              {cta === "pass" && (
                <Link
                  href="/dashboard/marketplace"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-6 gap-1 text-[10px] px-1.5")}
                >
                  <ShoppingCart className="size-2.5" />
                  Acheter un Pack
                </Link>
              )}
              {cta === "wallet" && (
                <Link
                  href="/dashboard/wallet"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-6 gap-1 text-[10px] px-1.5")}
                >
                  <Wallet className="size-2.5" />
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
