"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutButton } from "@/features/billing/components/checkout-button";
import { initiateCheckoutAction } from "@/features/billing/actions";
import { effectivePlanPrice } from "@/lib/utils/plan-price";
import { formatCurrency } from "@/lib/format";

type PlanOption = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  interval: string;
  isPromoted: boolean;
  badge: string | null;
  features: unknown;
  promoPrice: number | null;
  promoEndsAt: Date | null;
};

export function PlanUpgradeDialog({
  plans,
  currentPlanSlug,
  openPlanSlug,
  onOpenChange,
}: {
  plans: PlanOption[];
  currentPlanSlug: string;
  openPlanSlug: string | null;
  onOpenChange: (slug: string | null) => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const plan = plans.find((p) => p.slug === openPlanSlug);
  const displayPrice = plan ? effectivePlanPrice(plan) : null;
  const marketingFeatures = plan ? (Array.isArray(plan.features) ? (plan.features as string[]) : []) : [];
  const isCurrent = plan?.slug === currentPlanSlug;

  // Reset coupon state when dialog closes or plan changes
  useEffect(() => {
    if (!openPlanSlug) {
      setCoupon("");
      setShowCoupon(false);
    }
  }, [openPlanSlug]);

  if (!plan) return null;

  return (
    <Dialog open={!!openPlanSlug} onOpenChange={(open) => onOpenChange(open ? openPlanSlug : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {plan.isPromoted && (
              <Badge className="gap-1">
                <Zap className="size-3" />
                {plan.badge || "Recommandé"}
              </Badge>
            )}
            Passer à {plan.name}
          </DialogTitle>
          <DialogDescription>
            {plan.description || "Mettez à niveau votre plan pour débloquer plus de fonctionnalités."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight">
              {displayPrice === 0
                ? "Gratuit"
                : displayPrice != null
                  ? formatCurrency(displayPrice, plan.currency)
                  : "Sur devis"}
            </span>
            {displayPrice !== null && displayPrice > 0 && (
              <span className="text-sm text-muted-foreground">
                /{plan.interval === "YEAR" ? "an" : "mois"}
              </span>
            )}
          </div>

          {/* Features */}
          {marketingFeatures.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {marketingFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="size-3.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          )}

          {/* Coupon */}
          {showCoupon ? (
            <div className="flex flex-col gap-1.5">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Code promo"
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Entrez le code promo reçu par email ou lors d&apos;une promotion. La réduction sera appliquée au paiement.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowCoupon(true)}
              className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              J&apos;ai un code promo
            </button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>
            Annuler
          </Button>
          {isCurrent ? (
            <Button disabled className="gap-2 opacity-60">
              Plan actuel
            </Button>
          ) : displayPrice === null ? (
            <Button disabled className="gap-2 opacity-60">
              Sur devis
            </Button>
          ) : (
            <CheckoutButton
              action={() => initiateCheckoutAction(plan.id, coupon || undefined)}
              label={`Passer à ${plan.name}`}
              className="gap-2"
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
