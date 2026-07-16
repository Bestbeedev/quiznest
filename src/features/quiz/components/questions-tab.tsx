"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Trash2 } from "lucide-react";

import { deleteQuestionAction } from "@/features/quiz/actions";
import { AddQuestionDialog } from "@/features/quiz/components/add-question-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Question, QuestionChoice } from "@/generated/prisma/client";

const TYPE_LABELS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "QCM",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

type QuestionWithChoices = Question & { choices: QuestionChoice[] };

export function QuestionsTab({ quizId, questions }: { quizId: string; questions: QuestionWithChoices[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (questionId: string) => {
    startTransition(async () => {
      await deleteQuestionAction(quizId, questionId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        <AddQuestionDialog quizId={quizId} />
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <HelpCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune question pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <p className="font-medium">{question.title}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{TYPE_LABELS[question.type]}</Badge>
                    <Badge variant="outline">{question.points} pt{question.points !== 1 ? "s" : ""}</Badge>
                  </div>
                  <ul className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground">
                    {question.choices.map((choice) => (
                      <li key={choice.id} className={choice.isCorrect ? "font-medium text-foreground" : ""}>
                        {choice.isCorrect ? "✓ " : "— "}
                        {choice.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => handleDelete(question.id)}
                  aria-label="Supprimer la question"
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
