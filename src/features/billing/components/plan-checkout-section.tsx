"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CheckoutButton } from "@/features/billing/components/checkout-button";
import { initiateCheckoutAction } from "@/features/billing/actions";

export function PlanCheckoutSection({ planId, planName }: { planId: string; planName: string }) {
  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {showCoupon ? (
        <Input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder="Code promo"
          className="h-8 text-xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowCoupon(true)}
          className="self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          J&apos;ai un code promo
        </button>
      )}
      <CheckoutButton
        className="w-full"
        action={() => initiateCheckoutAction(planId, coupon || undefined)}
        label={`Passer à ${planName}`}
      />
    </div>
  );
}
