import type { Metadata } from "next";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listQuizzes } from "@/lib/services/quiz";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { QuizViewProvider } from "@/features/quiz/components/quiz-view-context";
import { QuizListView } from "./quiz-list-view";

export const metadata: Metadata = {
  title: "Quiz — QuizNest",
};

export default async function QuizListPage() {
  const organization = await requireActiveOrganization();
  const [quizzes, subscription] = await Promise.all([
    listQuizzes(organization.id),
    getOrganizationSubscription(organization.id),
  ]);

  const plan = subscription?.plan;

  return (
    <QuizViewProvider>
      <QuizListView
        quizzes={quizzes}
        planSlug={plan?.slug ?? "free"}
        quizLimit={plan?.quizLimit ?? null}
      />
    </QuizViewProvider>
  );
}
