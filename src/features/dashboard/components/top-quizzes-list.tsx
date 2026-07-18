import Link from "next/link";
import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopQuizzesList({
  quizzes,
}: {
  quizzes: { id: string; title: string; participants: number }[];
}) {
  const max = quizzes[0]?.participants ?? 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Quiz les plus suivis</CardTitle>
      </CardHeader>
      <CardContent>
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Trophy className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Pas encore de participants.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {quizzes.map((quiz) => (
              <li key={quiz.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className="min-w-0 truncate font-medium hover:underline"
                  >
                    {quiz.title}
                  </Link>
                  <span className="shrink-0 text-muted-foreground">
                    {quiz.participants} participant{quiz.participants !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${max > 0 ? (quiz.participants / max) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
