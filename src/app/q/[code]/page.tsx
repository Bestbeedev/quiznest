import type { Metadata } from "next";
import { Clock, HelpCircle, Repeat } from "lucide-react";

import { getPublicQuiz } from "@/lib/services/participation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartAttemptForm } from "@/features/participation/components/start-attempt-form";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Participer — QuizNest",
};

export default async function PublicQuizPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const quiz = await getPublicQuiz(code);

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz introuvable</CardTitle>
          <CardDescription>
            Ce quiz n&apos;existe pas, n&apos;est plus disponible, ou n&apos;a pas encore été
            publié.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Reveal direction="scale">
      <Card>
        <CardHeader>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            {quiz.organization.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={quiz.organization.logo}
                alt={quiz.organization.name}
                className="size-5 shrink-0 rounded object-cover"
              />
            ) : null}
            <span>Organisé par {quiz.organization.name}</span>
          </div>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="size-4" />
              {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
            </span>
            {quiz.timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {quiz.timeLimit} min
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Repeat className="size-4" />
              {quiz.attempts} tentative{quiz.attempts !== 1 ? "s" : ""}
            </span>
          </div>

          <StartAttemptForm accessCode={code} />
        </CardContent>
      </Card>
    </Reveal>
  );
}
