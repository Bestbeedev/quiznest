"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { archiveQuizAction, publishQuizAction } from "@/features/quiz/actions";
import { QuizStatusBadge } from "@/features/quiz/components/quiz-status-badge";
import { ShareQuizDialog } from "@/features/quiz/components/share-quiz-dialog";
import { Button } from "@/components/ui/button";
import type { QuizStatus } from "@/generated/prisma/client";

export function QuizDetailHeader({
  quizId,
  title,
  status,
  accessCode,
}: {
  quizId: string;
  title: string;
  status: QuizStatus;
  accessCode: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>, message: string) => {
    startTransition(async () => {
      await action();
      router.refresh();
      toast.success(message);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <QuizStatusBadge status={status} />
      </div>
      <div className="flex items-center gap-2">
        {status === "PUBLISHED" && accessCode && <ShareQuizDialog accessCode={accessCode} />}
        {status === "DRAFT" && (
          <Button disabled={isPending} onClick={() => run(() => publishQuizAction(quizId), "Quiz publié.")}>
            Publier
          </Button>
        )}
        {status === "PUBLISHED" && (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => run(() => archiveQuizAction(quizId), "Quiz archivé.")}
          >
            Archiver
          </Button>
        )}
      </div>
    </div>
  );
}
