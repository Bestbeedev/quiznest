import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllQuestions } from "@/lib/services/question";
import { listQuizzes } from "@/lib/services/quiz";
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionsCharts } from "./questions-charts";
import { QuestionBankView } from "./question-bank-view";

export const metadata: Metadata = buildMetadata({
  title: "Banque de Questions",
  description:
    "Consultez et gérez toutes vos questions : par type, difficulté et catégorie. Réutilisez vos questions entre plusieurs quiz.",
  path: "/dashboard/questions",
});

export default async function QuestionsPage() {
  const organization = await requireActiveOrganization();
  const [questions, quizzes] = await Promise.all([
    listAllQuestions(organization.id),
    listQuizzes(organization.id),
  ]);

  const typeCount = questions.reduce(
    (acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const difficultyCount = questions.reduce(
    (acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const difficultyPoints = Object.entries(difficultyCount).map(([key, val]) => ({
    name: DIFFICULTY_LABELS[key] ?? key,
    value: val,
  }));

  const typeData = Object.entries(typeCount).map(([key, val]) => ({
    type: key,
    count: val,
  }));

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Banque de questions"
        subtitle="Toutes les questions de vos quiz, réunies au même endroit."
      />

      {questions.length === 0 ? (
        <EmptyStateCard
          icon={HelpCircle}
          title="Aucune question pour le moment"
          description="Ajoutez des questions à un quiz pour les retrouver ici."
        />
      ) : (
        <>
          <Section title="Statistiques" description="Vue d'ensemble de vos questions">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <HelpCircle className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{questions.length}</p>
                  </div>
                </CardContent>
              </Card>
              {Object.entries(typeCount).slice(0, 3).map(([type, count]) => (
                <Card key={type}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <HelpCircle className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {QUESTION_TYPE_LABELS[type] ?? type}
                      </p>
                      <p className="text-lg font-semibold">{count}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>

          <Section title="Répartition" description="Distribution par type et difficulté">
            <QuestionsCharts
              typeData={typeData}
              difficultyData={difficultyPoints}
              totalPoints={totalPoints}
              totalQuestions={questions.length}
            />
          </Section>

          <Section title="Toutes les questions" description="Gestion et recherche">
            <QuestionBankView questions={questions} quizzes={quizzes} />
          </Section>
        </>
      )}
    </div>
  );
}
