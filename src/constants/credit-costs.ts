/**
 * Credit costs for pay-as-you-go features.
 *
 * These are charged when the user has exhausted their plan quota AND has no
 * active pass granting the feature AND no relevant add-on unlock.
 *
 * All amounts are in wallet credits (1 credit = 1 XOF when purchasing packs).
 */
export const CREDIT_COSTS = {
  /** Per question generated via AI (batch or single) */
  AI_GENERATION: 2,

  /** Per export run (PDF, Excel, or CSV) */
  EXPORT: 1,

  /** Per certificate generated */
  CERTIFICATE: 3,
} as const;

export type CreditCostKey = keyof typeof CREDIT_COSTS;

/** Human-readable labels for the credit cost table UI */
export const CREDIT_COST_LABELS: Record<CreditCostKey, { label: string; description: string; per: string }> = {
  AI_GENERATION: {
    label: "Génération IA",
    description: "Générer des questions via intelligence artificielle",
    per: "par question",
  },
  EXPORT: {
    label: "Export de données",
    description: "Exporter les résultats en PDF, Excel ou CSV",
    per: "par export",
  },
  CERTIFICATE: {
    label: "Certificat",
    description: "Générer un certificat pour un participant",
    per: "par certificat",
  },
};
