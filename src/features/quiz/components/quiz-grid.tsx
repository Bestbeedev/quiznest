"use client";

import Link from "next/link";
import { FileText, HelpCircle, Play, BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizRowActions } from "./quiz-row-actions";
import { useQuizView } from "./quiz-view-context";
import type { Quiz } from "@/generated/prisma/client";
import type { QuizRow } from "./quiz-columns";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

const STATUS_VARIANT: Record<string, "secondary" | "default" | "outline"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

export function QuizGrid({ quizzes }: { quizzes: QuizRow[] }) {
  const { view } = useQuizView();

  if (view === "list") return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Link key={quiz.id} href={`/dashboard/quiz/${quiz.id}`} className="group block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="p-4 pb-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>
                <QuizRowActions quizId={quiz.id} status={quiz.status} />
              </div>
              <div className="mt-3 space-y-1">
                <CardTitle className="text-sm font-medium leading-snug group-hover:underline">
                  {quiz.title}
                </CardTitle>
                <Badge variant={STATUS_VARIANT[quiz.status]}>
                  {STATUS_LABEL[quiz.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HelpCircle className="size-3.5" />
                  {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Play className="size-3.5" />
                  {quiz.attempts ?? 0} tentative{(quiz.attempts ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
