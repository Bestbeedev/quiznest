import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllQuestions } from "@/lib/services/question";
import { listQuizzes } from "@/lib/services/quiz";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionsCharts } from "./questions-charts";
import { QuestionBankView } from "./question-bank-view";

export const metadata: Metadata = {
  title: "Banque de questions — QuizNest",
};

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
    name: DIFFICULTY_LABELS[key as keyof typeof DIFFICULTY_LABELS] ?? key,
    value: val,
  }));

  const typeData = Object.entries(typeCount).map(([key, val]) => ({
    type: key,
    count: val,
  }));

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Banque de questions</h1>
        <p className="text-sm text-muted-foreground">
          Toutes les questions de vos quiz, réunies au même endroit.
        </p>
      </div>

      {questions.length === 0 ? (
        <EmptyStateCard
          icon={HelpCircle}
          title="Aucune question pour le moment"
          description="Ajoutez des questions à un quiz pour les retrouver ici."
        />
      ) : (
        <>
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
                      {TYPE_LABELS[type as keyof typeof TYPE_LABELS] ?? type}
                    </p>
                    <p className="text-lg font-semibold">{count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <QuestionsCharts
            typeData={typeData}
            difficultyData={difficultyPoints}
            totalPoints={totalPoints}
            totalQuestions={questions.length}
          />

          <QuestionBankView questions={questions} quizzes={quizzes} />
        </>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "QCM",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};
