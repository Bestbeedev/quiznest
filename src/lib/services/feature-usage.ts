import "server-only";
import { prisma } from "@/lib/db/client";
import { METERED_ADDON_EFFECTS } from "@/constants/addon-effects";
import { FEATURE_ADDON_BONUS } from "@/constants/feature-addon";
import { decrementAddonRemaining } from "@/lib/services/addon";
import type { FeatureKey } from "@/generated/prisma/client";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Current calendar-month usage count for a feature — 0 if nothing consumed
 * yet this month (a new month simply has no row, no reset job needed). */
export async function getFeatureUsage(organizationId: string, feature: FeatureKey) {
  const usage = await prisma.featureUsage.findUnique({
    where: { organizationId_feature_period: { organizationId, feature, period: currentPeriod() } },
  });
  return usage?.count ?? 0;
}

export async function incrementFeatureUsage(organizationId: string, feature: FeatureKey, by = 1) {
  const period = currentPeriod();
  await prisma.featureUsage.upsert({
    where: { organizationId_feature_period: { organizationId, feature, period } },
    create: { organizationId, feature, period, count: by },
    update: { count: { increment: by } },
  });

  // Decrement metered add-on remaining (e.g. EXTRA_AI_GENERATIONS) so the
  // bonus sum reflects actual consumption, not just initial purchase amount.
  const addonEffect = FEATURE_ADDON_BONUS[feature];
  if (addonEffect && METERED_ADDON_EFFECTS.has(addonEffect)) {
    await decrementAddonRemaining(organizationId, addonEffect, by);
  }
}
