import "server-only";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { CREDIT_COSTS, type CreditCostKey } from "@/constants/credit-costs";

/**
 * Returns the credit cost for a feature, reading from PlatformSettings first.
 * Falls back to the hardcoded default when the DB value is null.
 */
export async function getCreditCost(key: CreditCostKey): Promise<number> {
  const settings = await getPlatformSettings();
  switch (key) {
    case "AI_GENERATION":
      return settings.creditCostAiGeneration ?? CREDIT_COSTS.AI_GENERATION;
    case "EXPORT":
      return settings.creditCostExport ?? CREDIT_COSTS.EXPORT;
    case "CERTIFICATE":
      return settings.creditCostCertificate ?? CREDIT_COSTS.CERTIFICATE;
  }
}

/**
 * Returns all credit costs (DB values with fallback defaults) for display in UI.
 */
export async function getAllCreditCosts(): Promise<Record<CreditCostKey, number>> {
  const settings = await getPlatformSettings();
  return {
    AI_GENERATION: settings.creditCostAiGeneration ?? CREDIT_COSTS.AI_GENERATION,
    EXPORT: settings.creditCostExport ?? CREDIT_COSTS.EXPORT,
    CERTIFICATE: settings.creditCostCertificate ?? CREDIT_COSTS.CERTIFICATE,
  };
}
