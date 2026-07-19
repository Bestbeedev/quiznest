import "server-only";
import { prisma } from "@/lib/db/client";
import type { FeatureKey } from "@/generated/prisma/client";

export type FeatureCheck = { allowed: boolean; reason?: string; limit?: number | null };

const INACTIVE_STATUSES = new Set(["CANCELED", "PAST_DUE"]);

/**
 * Central authorization point for every plan-gated feature — every UI,
 * Server Action, and route must resolve access through this function
 * (`featureGate.can` in Prompt-Archi.md) rather than comparing a plan
 * name/slug directly. Pricing/feature changes made from /admin/plans then
 * take effect everywhere with no code change.
 *
 * Pay-as-you-go, Wallet, Pass and coupon overrides are a later phase (see
 * project roadmap memory) — today this resolves plan entitlement only.
 */
export async function canUseFeature(organizationId: string, feature: FeatureKey): Promise<FeatureCheck> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: { include: { planFeatures: { where: { feature } } } } },
  });

  if (!subscription) {
    return { allowed: false, reason: "Aucun abonnement actif." };
  }
  if (INACTIVE_STATUSES.has(subscription.status)) {
    return { allowed: false, reason: "Votre abonnement n'est plus actif." };
  }

  const grant = subscription.plan.planFeatures[0];
  if (!grant || !grant.enabled) {
    return {
      allowed: false,
      reason: `Cette fonctionnalité n'est pas incluse dans le plan ${subscription.plan.name}.`,
    };
  }

  return { allowed: true, limit: grant.limit };
}

export async function getOrganizationFeatures(organizationId: string): Promise<Set<FeatureKey>> {
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: { include: { planFeatures: { where: { enabled: true } } } } },
  });

  if (!subscription || INACTIVE_STATUSES.has(subscription.status)) {
    return new Set();
  }

  return new Set(subscription.plan.planFeatures.map((f) => f.feature));
}
