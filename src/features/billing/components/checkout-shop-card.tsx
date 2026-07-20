"use client";

import { initiateWalletTopUpAction, initiateAddOnCheckoutAction, initiatePassCheckoutAction } from "@/features/billing/actions";
import { ShopCard } from "./shop-card";

type CheckoutType = "wallet" | "addon" | "pass";

const ACTION_MAP: Record<CheckoutType, (id: string) => Promise<{ success: true; checkoutUrl: string } | { error: string }>> = {
  wallet: initiateWalletTopUpAction,
  addon: initiateAddOnCheckoutAction,
  pass: initiatePassCheckoutAction,
};

export function CheckoutShopCard({
  checkoutType,
  itemId,
  actionLabel,
  ...props
}: {
  checkoutType: CheckoutType;
  itemId: string;
  actionLabel?: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  meta?: string;
  badge?: string;
}) {
  const action = () => ACTION_MAP[checkoutType](itemId);
  return <ShopCard {...props} action={action} actionLabel={actionLabel} />;
}
