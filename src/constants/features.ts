import type { FeatureKey } from "@/generated/prisma/client";

/** Every feature the Feature Gate can grant/deny — keep in sync with the
 * `FeatureKey` enum in schema.prisma (Prompt-Archi.md "FEATURE GATE"). */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  AI_GENERATION: "Génération IA",
  AI_IMPORT: "Import IA",
  QUESTION_BANK: "Banque de questions",
  CERTIFICATES: "Certificats",
  EXPORT_PDF: "Export PDF",
  EXPORT_EXCEL: "Export Excel",
  EXPORT_CSV: "Export CSV",
  ADVANCED_ANALYTICS: "Statistiques avancées",
  CUSTOM_BRANDING: "Branding personnalisé",
  CUSTOM_DOMAIN: "Domaine personnalisé",
  WEBHOOKS: "Webhooks",
  API_ACCESS: "Accès API",
  MULTI_TEAM: "Multi-équipes",
  LIVE_MONITORING: "Monitoring en direct",
  EMAIL_NOTIFICATIONS: "Notifications email",
  SMS_NOTIFICATIONS: "Notifications SMS",
  WHITE_LABEL: "White label",
};

export const ALL_FEATURES = Object.keys(FEATURE_LABELS) as FeatureKey[];
