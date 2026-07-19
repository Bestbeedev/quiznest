"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteQuestionAction } from "@/features/quiz/actions";
import { AddQuestionDialog } from "@/features/quiz/components/add-question-dialog";
import { AiGenerateDialog } from "@/features/quiz/components/ai-generate-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, QuestionChoice } from "@/generated/prisma/client";

const TYPE_LABELS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "QCM",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

const TYPE_COLORS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  MULTIPLE_CHOICE: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  TRUE_FALSE: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  SHORT_ANSWER: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

type QuestionWithChoices = Question & { choices: QuestionChoice[] };

export function QuestionsTab({
  quizId,
  quizTitle,
  questions,
}: {
  quizId: string;
  quizTitle: string;
  questions: QuestionWithChoices[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (questionId: string) => {
    startTransition(async () => {
      await deleteQuestionAction(quizId, questionId);
      router.refresh();
      toast.success("Question supprimée.");
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <AiGenerateDialog quizId={quizId} quizTitle={quizTitle} />
          <AddQuestionDialog quizId={quizId} />
        </div>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <HelpCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune question pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="group flex items-start gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{question.title}</p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", TYPE_COLORS[question.type])}>
                    {TYPE_LABELS[question.type]}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {question.points} pt{question.points !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {question.choices.length > 0 && (
                  <div className="mt-3 grid gap-1 sm:grid-cols-2">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm",
                          choice.isCorrect
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="text-xs">
                          {choice.isCorrect ? "✓" : "—"}
                        </span>
                        <span className="truncate">{choice.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => handleDelete(question.id)}
                aria-label="Supprimer la question"
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
