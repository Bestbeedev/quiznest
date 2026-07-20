import "server-only";
import { prisma } from "@/lib/db/client";
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
}
