import { notFound } from "next/navigation";
import { Users, BarChart3 } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getQuiz } from "@/lib/services/quiz";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizDetailHeader } from "@/features/quiz/components/quiz-detail-header";
import { QuestionsTab } from "@/features/quiz/components/questions-tab";
import { QuizSettingsForm } from "@/features/quiz/components/quiz-settings-form";

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

  return (
    <div className="flex flex-col gap-6">
      <QuizDetailHeader quizId={quiz.id} title={quiz.title} status={quiz.status} />

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionsTab quizId={quiz.id} quizTitle={quiz.title} questions={quiz.questions} />
        </TabsContent>

        <TabsContent value="participants">
          <EmptyStateCard
            icon={Users}
            title="Participants"
            description="Le suivi des participants sera disponible une fois le quiz publié et partagé."
          />
        </TabsContent>

        <TabsContent value="results">
          <EmptyStateCard
            icon={BarChart3}
            title="Résultats"
            description="Les statistiques de résultats apparaîtront après les premières tentatives."
          />
        </TabsContent>

        <TabsContent value="settings">
          <QuizSettingsForm quiz={quiz} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
