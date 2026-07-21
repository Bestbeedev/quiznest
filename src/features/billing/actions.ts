"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import {
  initiateSubscriptionCheckout,
  initiateWalletTopUpCheckout,
  initiateAddOnCheckout,
  initiatePassCheckout,
} from "@/lib/services/payment";
import { canUseFeature } from "@/lib/services/feature-gate";
import { spendCredits, getOrCreateWallet } from "@/lib/services/wallet";
import { getCreditCost } from "@/lib/services/credit-costs";
import { ValidationError } from "@/lib/errors";
import type { FeatureKey } from "@/generated/prisma/client";

async function checkoutContext() {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const headerList = await headers();
  const origin = headerList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [firstName, ...rest] = session.user.name?.split(" ") ?? [];

  return {
    organization,
    customer: { email: session.user.email, firstName, lastName: rest.join(" ") },
    origin,
  };
}

function handleCheckoutError(error: unknown) {
  if (error instanceof ValidationError) return { error: error.message };
  if (error instanceof Error) return { error: error.message };
  throw error;
}

export async function initiateCheckoutAction(planId: string, couponCode?: string) {
  const { organization, customer, origin } = await checkoutContext();
  try {
    const { checkoutUrl } = await initiateSubscriptionCheckout(
      organization.id,
      planId,
      customer,
      `${origin}/dashboard/billing`,
      couponCode,
    );
    return { success: true as const, checkoutUrl };
  } catch (error) {
    return handleCheckoutError(error);
  }
}

export async function initiateWalletTopUpAction(creditPackId: string) {
  const { organization, customer, origin } = await checkoutContext();
  try {
    const { checkoutUrl } = await initiateWalletTopUpCheckout(
      organization.id,
      creditPackId,
      customer,
      `${origin}/dashboard/billing`,
    );
    return { success: true as const, checkoutUrl };
  } catch (error) {
    return handleCheckoutError(error);
  }
}

export async function initiateAddOnCheckoutAction(productId: string) {
  const { organization, customer, origin } = await checkoutContext();
  try {
    const { checkoutUrl } = await initiateAddOnCheckout(
      organization.id,
      productId,
      customer,
      `${origin}/dashboard/billing`,
    );
    return { success: true as const, checkoutUrl };
  } catch (error) {
    return handleCheckoutError(error);
  }
}

export async function initiatePassCheckoutAction(passId: string) {
  const { organization, customer, origin } = await checkoutContext();
  try {
    const { checkoutUrl } = await initiatePassCheckout(
      organization.id,
      passId,
      customer,
      `${origin}/dashboard/billing`,
    );
    return { success: true as const, checkoutUrl };
  } catch (error) {
    return handleCheckoutError(error);
  }
}

/**
 * Pre-charge credits before a client-side export. The client calls this action,
 * and only proceeds with the export if it returns success. If the feature is
 * already allowed (plan/pass/addon), no credits are charged.
 */
export async function chargeExportCreditsAction(featureKey: FeatureKey) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();

  try {
    const check = await canUseFeature(organization.id, featureKey);
    if (check.allowed) {
      return { success: true as const, charged: false };
    }

    // Feature not allowed — try wallet credit fallback
    const wallet = await getOrCreateWallet(organization.id);
    const cost = await getCreditCost("EXPORT");
    if (wallet.balance < cost) {
      return {
        error: `Solde insuffisant : un export coûte ${cost} crédit${cost !== 1 ? "s" : ""} mais vous n'en avez que ${wallet.balance}. Rechargez votre wallet.`,
      };
    }

    await spendCredits(organization.id, cost, `Export (${featureKey})`);
    return { success: true as const, charged: true, amount: cost };
  } catch (error) {
    return handleCheckoutError(error);
  }
}
