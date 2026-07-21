import "server-only";
import { getAddOnBonus } from "@/lib/services/addon";

/** A plan's base numeric limit extended by any Pay-as-you-go add-ons the org
 * has purchased for the matching effect — null stays unlimited regardless
 * (an unlimited plan has nothing for an add-on to extend). */
async function effectiveLimit(organizationId: string, baseLimit: number | null, effect: "EXTRA_QUIZZES" | "EXTRA_PARTICIPANTS" | "EXTRA_QUESTIONS") {
  if (baseLimit === null) return null;
  const bonus = await getAddOnBonus(organizationId, effect);
  return baseLimit + bonus;
}

export function getEffectiveQuizLimit(organizationId: string, baseLimit: number | null) {
  return effectiveLimit(organizationId, baseLimit, "EXTRA_QUIZZES");
}

export function getEffectiveParticipantLimit(organizationId: string, baseLimit: number | null) {
  return effectiveLimit(organizationId, baseLimit, "EXTRA_PARTICIPANTS");
}

export function getEffectiveQuestionLimit(organizationId: string, baseLimit: number | null) {
  return effectiveLimit(organizationId, baseLimit, "EXTRA_QUESTIONS");
}
