"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { archiveQuizAction, publishQuizAction } from "@/features/quiz/actions";
import { QuizStatusBadge } from "@/features/quiz/components/quiz-status-badge";
import { Button } from "@/components/ui/button";
import type { QuizStatus } from "@/generated/prisma/client";

export function QuizDetailHeader({
  quizId,
  title,
  status,
}: {
  quizId: string;
  title: string;
  status: QuizStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <QuizStatusBadge status={status} />
      </div>
      {status === "DRAFT" && (
        <Button disabled={isPending} onClick={() => run(() => publishQuizAction(quizId))}>
          Publier
        </Button>
      )}
      {status === "PUBLISHED" && (
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => archiveQuizAction(quizId))}
        >
          Archiver
        </Button>
      )}
    </div>
  );
}
