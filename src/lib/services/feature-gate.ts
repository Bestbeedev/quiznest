import "server-only";
import { prisma } from "@/lib/db/client";
import { getFeatureUsage } from "@/lib/services/feature-usage";
import { getActivePassFeatures } from "@/lib/services/pass";
import { getAddOnBonus, hasAddOnUnlock } from "@/lib/services/addon";
import type { FeatureKey } from "@/generated/prisma/client";

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
  /** Rich, user-facing message explaining the denial with actionable guidance.
   * Always includes quota details and what the user can do to unlock the feature. */
  message?: string;
  /** Which CTA to suggest: "upgrade" = upgrade plan, "pass" = buy a pass,
   * "wallet" = use credits, or "none" when the feature is simply unavailable. */
  cta?: "upgrade" | "pass" | "wallet" | "none";
};

const INACTIVE_STATUSES = new Set(["CANCELED", "PAST_DUE"]);

/** Human-readable French labels for every FeatureKey — used in user-facing
 * messages so we never expose raw enum values. */
const FEATURE_LABELS: Record<FeatureKey, string> = {
  AI_GENERATION: "Génération IA",
  AI_IMPORT: "Import IA",
  QUESTION_BANK: "Banque de questions",
  CERTIFICATES: "Certificats",
  EXPORT_PDF: "Export PDF",
  EXPORT_EXCEL: "Export Excel",
  EXPORT_CSV: "Export CSV",
  ADVANCED_ANALYTICS: "Analyses avancées",
  CUSTOM_BRANDING: "Personnalisation de marque",
  CUSTOM_DOMAIN: "Domaine personnalisé",
  WEBHOOKS: "Webhooks",
  API_ACCESS: "Accès API",
  MULTI_TEAM: "Équipes multiples",
  LIVE_MONITORING: "Suivi en temps réel",
  EMAIL_NOTIFICATIONS: "Notifications email",
  SMS_NOTIFICATIONS: "Notifications SMS",
  WHITE_LABEL: "White-label",
};

function featureLabel(feature: FeatureKey): string {
  return FEATURE_LABELS[feature] ?? feature;
}

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

  // Check one-time add-on unlocks (e.g. EXPORT_UNLOCK, CERTIFICATE_UNLOCK)
  const unlocked = await hasAddOnUnlock(organizationId, feature);
  if (unlocked) {
    return { allowed: true, limit: null, source: "plan" };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: { plan: { include: { planFeatures: { where: { feature } } } } },
  });

  if (!subscription) {
    return {
      allowed: false,
      reason: "Aucun abonnement actif.",
      message: "Aucun abonnement actif trouvé pour cette organisation. Souscrivez à un plan pour débloquer les fonctionnalités.",
      cta: "upgrade",
      source: "plan",
    };
  }
  if (INACTIVE_STATUSES.has(subscription.status)) {
    return {
      allowed: false,
      reason: "Votre abonnement n'est plus actif.",
      message: `Votre abonnement "${subscription.plan.name}" est en statut ${subscription.status === "CANCELED" ? "annulé" : "en retard de paiement"}. Mettez à jour votre paiement ou souscrivez à un nouveau plan.`,
      cta: "upgrade",
      source: "plan",
    };
  }

  const grant = subscription.plan.planFeatures[0];
  if (!grant || !grant.enabled) {
    return {
      allowed: false,
      reason: `Cette fonctionnalité n'est pas incluse dans le plan ${subscription.plan.name}.`,
      message: `La fonctionnalité « ${featureLabel(feature)} » n'est pas incluse dans votre plan ${subscription.plan.name}. Passez au plan supérieur ou achetez un Pass pour y accéder.`,
      cta: "upgrade",
      source: "plan",
    };
  }

  if (grant.limit == null) {
    return { allowed: true, limit: null, source: "plan" };
  }

  const bonus = await getAddOnBonus(organizationId, feature);
  const effectiveLimit = grant.limit + bonus;

  const used = await getFeatureUsage(organizationId, feature);
  const remaining = Math.max(effectiveLimit - used, 0);

  if (remaining <= 0) {
    const hasPassOption = !passFeatures.has(feature);
    return {
      allowed: false,
      reason: `Quota mensuel atteint (${effectiveLimit}) pour cette fonctionnalité sur le plan ${subscription.plan.name}.`,
      message: `Quota mensuel atteint : ${used}/${effectiveLimit} utilisations sur le plan ${subscription.plan.name}. ${hasPassOption ? "Achetez un Pack IA pour continuer, " : ""}upgradez votre plan pour un quota plus élevé, ou attendez le prochain mois.`,
      limit: effectiveLimit,
      used,
      remaining: 0,
      cta: bonus > 0 ? "pass" : "upgrade",
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
