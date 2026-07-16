import Link from "next/link";
import { ListChecks } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizStatusBadge } from "@/features/quiz/components/quiz-status-badge";
import type { Quiz } from "@/generated/prisma/client";

type QuizWithCount = Quiz & { _count: { questions: number } };

export function RecentQuizzesCard({ quizzes }: { quizzes: QuizWithCount[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Derniers quiz créés</CardTitle>
      </CardHeader>
      <CardContent>
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ListChecks className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucun quiz pour le moment.</p>
            <Link href="/dashboard/quiz" className="text-sm text-primary underline underline-offset-4">
              Créer votre premier quiz
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col divide-y">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {quiz.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                  </p>
                </div>
                <QuizStatusBadge status={quiz.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
