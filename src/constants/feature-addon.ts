import type { FeatureKey, AddOnEffect } from "@/generated/prisma/client";

/** Pay-as-you-go packs that top up a metered feature's monthly quota rather
 * than granting a whole new feature — e.g. an "AI pack" purchase extends
 * AI_GENERATION's limit without touching the plan. */
export const FEATURE_ADDON_BONUS: Partial<Record<FeatureKey, AddOnEffect>> = {
  AI_GENERATION: "EXTRA_AI_GENERATIONS",
};

/** One-time add-on unlocks that grant access to a feature entirely —
 * e.g. buying EXPORT_UNLOCK grants access to all export formats. */
export const FEATURE_ADDON_UNLOCK: Partial<Record<FeatureKey, AddOnEffect>> = {
  EXPORT_PDF: "EXPORT_UNLOCK",
  EXPORT_EXCEL: "EXPORT_UNLOCK",
  EXPORT_CSV: "EXPORT_UNLOCK",
  CERTIFICATES: "CERTIFICATE_UNLOCK",
};
