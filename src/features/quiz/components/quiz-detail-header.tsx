"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { archiveQuizAction, publishQuizAction, updateQuizTitleAction } from "@/features/quiz/actions";
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

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitTitle = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateQuizTitleAction(quizId, { title: trimmed });
      if (result?.error) {
        toast.error(result.error);
        setDraft(title);
      } else {
        toast.success("Titre mis à jour.");
      }
      setEditing(false);
      router.refresh();
    });
  };

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
        {editing ? (
          <input
            ref={inputRef}
            className="text-2xl font-semibold tracking-tight bg-background border border-input rounded-md px-2 py-0.5 outline-none focus:ring-2 focus:ring-ring w-full min-w-[200px]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setDraft(title);
                setEditing(false);
              }
            }}
            autoFocus
            disabled={isPending}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              onClick={() => {
                setDraft(title);
                setEditing(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              aria-label="Modifier le titre"
            >
              <Pencil className="size-4" />
            </button>
          </>
        )}
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
