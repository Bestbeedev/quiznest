import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type RankedQuestion = { id: string; title: string; successRate: number | null; quiz: { id: string; title: string } };

function QuestionRankList({ questions }: { questions: RankedQuestion[] }) {
  return (
    <ul className="flex flex-col divide-y">
      {questions.map((q) => (
        <li key={q.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{q.title}</p>
            <Link
              href={`/dashboard/quiz/${q.quiz.id}`}
              className="text-xs text-muted-foreground hover:underline"
            >
              {q.quiz.title}
            </Link>
          </div>
          <Badge variant="outline" className="shrink-0">
            {q.successRate}%
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export function QuestionDifficultyLists({
  hardest,
  easiest,
}: {
  hardest: RankedQuestion[];
  easiest: RankedQuestion[];
}) {
  if (hardest.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <TrendingDown className="size-4 text-destructive" />
            Questions difficiles
          </CardTitle>
          <CardDescription>Taux de réussite le plus bas</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionRankList questions={hardest} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5 text-base">
            <TrendingUp className="size-4 text-primary" />
            Questions faciles
          </CardTitle>
          <CardDescription>Taux de réussite le plus haut</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionRankList questions={easiest} />
        </CardContent>
      </Card>
    </div>
  );
}
