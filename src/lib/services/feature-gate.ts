import "server-only";
import { prisma } from "@/lib/db/client";
import { getFeatureUsage } from "@/lib/services/feature-usage";
import { getActivePassFeatures } from "@/lib/services/pass";
import { getAddOnBonus } from "@/lib/services/addon";
import type { FeatureKey, AddOnEffect } from "@/generated/prisma/client";

/** Pay-as-you-go packs that top up a metered feature's monthly quota rather
 * than granting a whole new feature — e.g. an "AI pack" purchase extends
 * AI_GENERATION's limit without touching the plan. */
const FEATURE_ADDON_BONUS: Partial<Record<FeatureKey, AddOnEffect>> = {
  AI_GENERATION: "EXTRA_AI_GENERATIONS",
};

export type FeatureCheck = {
  allowed: boolean;
  reason?: string;
  limit?: number | null;
  used?: number;
  remaining?: number | null;
  /** "plan" when granted (or denied) purely by the subscription; "pass"
   * when an active Pass is what's actually granting access — useful for UI
   * copy ("Inclus via votre Pass" vs "Inclus dans votre plan"). */
  source?: "plan" | "pass";
};

const INACTIVE_STATUSES = new Set(["CANCELED", "PAST_DUE"]);

/**
 * Central authorization point for every plan-gated feature — every UI,
 * Server Action, and route must resolve access through this function
 * (`featureGate.can` in Prompt-Archi.md) rather than comparing a plan
 * name/slug directly. Pricing/feature changes made from /admin/plans then
 * take effect everywhere with no code change.
 *
 * Resolution order: an active Pass granting this feature always allows it
 * (Pass access isn't usage-metered); otherwise falls back to the plan's
 * grant + this calendar month's consumption against `PlanFeature.limit`.
 * Wallet/PAYG overrides for specific features are a later phase.
 */
export async function canUseFeature(organizationId: string, feature: FeatureKey): Promise<FeatureCheck> {
  const passFeatures = await getActivePassFeatures(organizationId);
  if (passFeatures.has(feature)) {
    return { allowed: true, limit: null, source: "pass" };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: { include: { planFeatures: { where: { feature } } } } },
  });

  if (!subscription) {
    return { allowed: false, reason: "Aucun abonnement actif.", source: "plan" };
  }
  if (INACTIVE_STATUSES.has(subscription.status)) {
    return { allowed: false, reason: "Votre abonnement n'est plus actif.", source: "plan" };
  }

  const grant = subscription.plan.planFeatures[0];
  if (!grant || !grant.enabled) {
    return {
      allowed: false,
      reason: `Cette fonctionnalité n'est pas incluse dans le plan ${subscription.plan.name}.`,
      source: "plan",
    };
  }

  if (grant.limit == null) {
    return { allowed: true, limit: null, source: "plan" };
  }

  const addOnEffect = FEATURE_ADDON_BONUS[feature];
  const bonus = addOnEffect ? await getAddOnBonus(organizationId, addOnEffect) : 0;
  const effectiveLimit = grant.limit + bonus;

  const used = await getFeatureUsage(organizationId, feature);
  const remaining = Math.max(effectiveLimit - used, 0);

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `Quota mensuel atteint (${effectiveLimit}) pour cette fonctionnalité sur le plan ${subscription.plan.name}.`,
      limit: effectiveLimit,
      used,
      remaining: 0,
      source: "plan",
    };
  }

  return { allowed: true, limit: effectiveLimit, used, remaining, source: "plan" };
}

export async function getOrganizationFeatures(organizationId: string): Promise<Set<FeatureKey>> {
  const [subscription, passFeatures] = await Promise.all([
    prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: { include: { planFeatures: { where: { enabled: true } } } } },
    }),
    getActivePassFeatures(organizationId),
  ]);

  const planFeatures =
    !subscription || INACTIVE_STATUSES.has(subscription.status)
      ? []
      : subscription.plan.planFeatures.map((f) => f.feature);

  return new Set([...planFeatures, ...passFeatures]);
}
