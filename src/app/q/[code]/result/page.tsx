import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Trophy,
  Target,
  Brain,
  CheckCircle2,
  XCircle,
  BarChart3,
  HelpCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react";

import { getPublicQuiz, getResult } from "@/lib/services/participation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Reveal } from "@/components/shared/reveal";
import { buildMetadata } from "@/constants/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Résultats du quiz",
    description: "Consultez votre score, vos réponses et les explications détaillées.",
    noindex: true,
  });
}

export default async function QuizResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ pid?: string }>;
}) {
  const { code } = await params;
  const { pid } = await searchParams;
  if (!pid) notFound();

  const quiz = await getPublicQuiz(code);
  if (!quiz) notFound();

  const { participant, answers } = await getResult(pid, quiz.id);

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalCount = answers.length;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <Reveal direction="scale">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${
              participant.passed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            {participant.passed ? <Trophy className="size-8" /> : <Brain className="size-8" />}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {participant.passed ? "Félicitations, vous avez réussi !" : "Quiz terminé"}
            </h1>
            <p className="text-sm text-muted-foreground">{quiz.title}</p>
          </div>
        </div>
      </Reveal>

      {/* Stats dashboard grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <BarChart3 className="size-4 text-primary" />
            <p className="text-2xl font-bold">{participant.percentage}%</p>
            <p className="text-[11px] text-muted-foreground">Score final</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Target className="size-4 text-primary" />
            <p className="text-2xl font-bold">
              {correctCount}
              <span className="text-base font-normal text-muted-foreground">/{totalCount}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Bonnes réponses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Sparkles className="size-4 text-primary" />
            <p className="text-2xl font-bold">{participant.score}</p>
            <p className="text-[11px] text-muted-foreground">Points obtenus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <Badge
              variant={participant.passed ? "default" : "secondary"}
              className="mt-1.25 px-3 py-1 text-xs"
            >
              {participant.passed ? "Réussi" : "Non réussi"}
            </Badge>
            <p className="pt-2.25 text-[11px] text-muted-foreground">Statut</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progression</span>
          <span>
            {correctCount}/{totalCount} bonnes réponses
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              participant.passed ? "bg-primary" : "bg-destructive"
            }`}
            style={{ width: `${participant.percentage}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* Questions review */}
      {answers.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Révision des réponses</h2>
            </div>
            <TabsList variant="line" className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                Toutes ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="correct" className="flex-1 sm:flex-initial">
                Correctes ({correctCount})
              </TabsTrigger>
              <TabsTrigger value="incorrect" className="flex-1 sm:flex-initial">
                Incorrectes ({totalCount - correctCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <Separator className="my-4" />

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {answers.map((answer, index) => (
                <QuestionCard key={answer.id} answer={answer} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="correct" className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {answers
                .filter((a) => a.isCorrect)
                .map((answer, index) => (
                  <QuestionCard key={answer.id} answer={answer} index={index} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="incorrect" className="mt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {answers
                .filter((a) => !a.isCorrect)
                .map((answer, index) => (
                  <QuestionCard key={answer.id} answer={answer} index={index} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function QuestionCard({
  answer,
  index,
}: {
  answer: {
    id: string;
    isCorrect: boolean;
    choiceIds: string[];
    question: {
      title: string;
      explanation: string | null;
      choices: { id: string; text: string; isCorrect: boolean }[];
    };
  };
  index: number;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
              {index + 1}
            </span>
            <CardTitle className="text-sm font-medium leading-snug">
              {answer.question.title}
            </CardTitle>
          </div>
          {answer.isCorrect ? (
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
          ) : (
            <XCircle className="size-5 shrink-0 text-destructive" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1.5">
          {answer.question.choices.map((choice) => {
            const isSelected = answer.choiceIds?.includes(choice.id);
            return (
              <div
                key={choice.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  choice.isCorrect
                    ? "border-primary/30 bg-primary/5"
                    : isSelected
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-transparent bg-muted/40"
                }`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    choice.isCorrect
                      ? "bg-primary text-primary-foreground"
                      : isSelected
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {choice.isCorrect ? "✓" : isSelected ? "✗" : ""}
                </span>
                <span
                  className={
                    choice.isCorrect
                      ? "font-medium text-foreground"
                      : isSelected
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }
                >
                  {choice.text}
                </span>
              </div>
            );
          })}
        </div>

        {answer.question.explanation && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Lightbulb className="size-3.5 text-primary" />
              Explication
            </span>
            <p className="mt-1 text-muted-foreground">{answer.question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
