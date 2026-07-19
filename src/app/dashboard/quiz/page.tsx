import type { Metadata } from "next";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listQuizzes } from "@/lib/services/quiz";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { QuizViewProvider } from "@/features/quiz/components/quiz-view-context";
import { QuizListView } from "./quiz-list-view";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Mes Quiz",
  description:
    "Gérez tous vos quiz : créez, éditez, publiez et suivez les participations depuis un seul endroit.",
  path: "/dashboard/quiz",
});

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
