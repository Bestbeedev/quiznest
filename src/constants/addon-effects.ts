import type { AddOnEffect } from "@/generated/prisma/client";

export const ADDON_EFFECT_LABELS: Record<AddOnEffect, string> = {
  EXTRA_PARTICIPANTS: "Participants supplémentaires",
  EXTRA_QUIZZES: "Quiz supplémentaires",
  EXTRA_QUESTIONS: "Questions supplémentaires (par quiz)",
  EXTRA_AI_GENERATIONS: "Générations IA supplémentaires",
  EXPORT_UNLOCK: "Déverrouillage des exports",
  CERTIFICATE_UNLOCK: "Déverrouillage des certificats",
};

/** Effects that add to a numeric org-wide quota — `amount` is required and
 * meaningful. The rest are one-off unlocks where `amount` is ignored. */
export const METERED_ADDON_EFFECTS = new Set<AddOnEffect>([
  "EXTRA_PARTICIPANTS",
  "EXTRA_QUIZZES",
  "EXTRA_QUESTIONS",
  "EXTRA_AI_GENERATIONS",
]);
