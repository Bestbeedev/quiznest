"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { searchQuizzes } from "@/lib/services/quiz";
import { searchQuestions } from "@/lib/services/question";

export async function globalSearchAction(query: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { quizzes: [], questions: [] };
  }

  const [quizzes, questions] = await Promise.all([
    searchQuizzes(organization.id, trimmed),
    searchQuestions(organization.id, trimmed),
  ]);

  return { quizzes, questions };
}
