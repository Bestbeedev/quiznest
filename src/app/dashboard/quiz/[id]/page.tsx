import Link from "next/link";
import { notFound } from "next/navigation";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getQuiz } from "@/lib/services/quiz";
import {
  listParticipants,
  getQuizResultsSummary,
  getQuizAttemptsTrend,
} from "@/lib/services/participation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { QuizDetailHeader } from "@/features/quiz/components/quiz-detail-header";
import { QuizDetailNav } from "@/features/quiz/components/quiz-detail-nav";
import { QuestionsTab } from "@/features/quiz/components/questions-tab";
import { QuizSettingsForm } from "@/features/quiz/components/quiz-settings-form";
import { ParticipantsTab } from "@/features/quiz/components/participants-tab";
import { ResultsTab } from "@/features/quiz/components/results-tab";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await requireActiveOrganization();
  const quiz = await getQuiz(organization.id, id);

  if (!quiz) {
    notFound();
  }

  const [participants, resultsSummary, attemptsTrend] = await Promise.all([
    listParticipants(organization.id, id),
    getQuizResultsSummary(organization.id, id),
    getQuizAttemptsTrend(organization.id, id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/dashboard/quiz" className="transition-colors hover:text-foreground">
              Quiz
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate">{quiz.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <QuizDetailHeader
        quizId={quiz.id}
        title={quiz.title}
        status={quiz.status}
        accessCode={quiz.accessCode}
      />

      <QuizDetailNav
        questions={<QuestionsTab quizId={quiz.id} quizTitle={quiz.title} questions={quiz.questions} />}
        participants={<ParticipantsTab quizId={quiz.id} participants={participants} />}
        results={
          <ResultsTab
            quizTitle={quiz.title}
            participants={participants}
            attemptsTrend={attemptsTrend}
            {...resultsSummary}
          />
        }
        settings={<QuizSettingsForm quiz={quiz} />}
      />
    </div>
  );
}
