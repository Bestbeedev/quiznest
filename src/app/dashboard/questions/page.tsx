import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Lock, ArrowUpRight } from "lucide-react";

import { buildMetadata } from "@/constants/seo";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { listAllQuestions } from "@/lib/services/question";
import { listQuizzes } from "@/lib/services/quiz";
import { canUseFeature } from "@/lib/services/feature-gate";
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { PageHeader } from "@/components/shared/page-header";
import { Section } from "@/components/shared/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { FeatureKey } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { QuestionsCharts } from "./questions-charts";
import { QuestionBankView } from "./question-bank-view";

export const metadata: Metadata = buildMetadata({
  title: "Banque de Questions",
  description:
    "Consultez et gérez toutes vos questions : par type, difficulté et catégorie. Réutilisez vos questions entre plusieurs quiz.",
  path: "/dashboard/questions",
});

const PREVIEW_QUESTION_COUNT = 5;

const TYPE_COLORS: Record<string, string> = {
  SINGLE_CHOICE: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  MULTIPLE_CHOICE: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  TRUE_FALSE: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  SHORT_ANSWER: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

export default async function QuestionsPage() {
  const organization = await requireActiveOrganization();
  const featureCheck = await canUseFeature(organization.id, "QUESTION_BANK" as FeatureKey);
  const isGated = !featureCheck.allowed;

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
  const previewQuestions = questions.slice(0, PREVIEW_QUESTION_COUNT);

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
          {isGated && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Aperçu de la Banque de questions</p>
                    <p className="text-xs text-muted-foreground">
                      Vous voyez {PREVIEW_QUESTION_COUNT} questions sur {questions.length}. Passez à un plan supérieur pour accéder à la vue complète avec recherche, filtrage et actions en masse.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0 gap-1.5")}
                >
                  <ArrowUpRight className="size-3.5" />
                  Débloquer
                </Link>
              </div>
            </div>
          )}

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

          <div className={cn("relative", isGated && "pointer-events-none select-none")}>
            <Section title="Répartition" description="Distribution par type et difficulté">
              <div className={cn(isGated && "blur-sm")}>
                <QuestionsCharts
                  typeData={typeData}
                  difficultyData={difficultyPoints}
                  totalPoints={totalPoints}
                  totalQuestions={questions.length}
                />
              </div>
            </Section>
            {isGated && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/dashboard/billing"
                  className={cn(buttonVariants({ variant: "default" }), "gap-1.5")}
                >
                  <Lock className="size-4" />
                  Débloquer les graphiques
                </Link>
              </div>
            )}
          </div>

          <div className={cn("relative", isGated && "max-h-[520px] overflow-hidden")}>
            <Section
              title="Toutes les questions"
              description={isGated ? `Aperçu : ${PREVIEW_QUESTION_COUNT} première(s) question(s)` : "Gestion et recherche"}
            >
              {isGated ? (
                <div className="flex flex-col gap-2">
                  {previewQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 rounded-xl border bg-card p-4"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{question.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", TYPE_COLORS[question.type])}>
                            {QUESTION_TYPE_LABELS[question.type] ?? question.type}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {question.points} pt{question.points !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <QuestionBankView questions={questions} quizzes={quizzes} />
              )}
            </Section>
            {isGated && (
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-4">
                <p className="text-sm text-muted-foreground">
                  {questions.length - PREVIEW_QUESTION_COUNT} question(s) de plus...
                </p>
                <Link
                  href="/dashboard/billing"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
                >
                  <ArrowUpRight className="size-3.5" />
                  Accéder à toutes les questions
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
