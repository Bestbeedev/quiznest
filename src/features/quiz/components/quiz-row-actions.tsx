"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";

import {
  archiveQuizAction,
  deleteQuizAction,
  duplicateQuizAction,
  publishQuizAction,
} from "@/features/quiz/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";
import type { QuizStatus } from "@/generated/prisma/client";

export function QuizRowActions({ quizId, status }: { quizId: string; status: QuizStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
          disabled={isPending}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/dashboard/quiz/${quizId}`)}>
            <Pencil />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(() => duplicateQuizAction(quizId))}>
            <Copy />
            Dupliquer
          </DropdownMenuItem>
          {status === "DRAFT" && (
            <DropdownMenuItem onClick={() => run(() => publishQuizAction(quizId))}>
              <Send />
              Publier
            </DropdownMenuItem>
          )}
          {status === "PUBLISHED" && (
            <DropdownMenuItem onClick={() => run(() => archiveQuizAction(quizId))}>
              <Archive />
              Archiver
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer ce quiz ?"
        description="Cette action est irréversible. Le quiz et ses questions seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={() =>
          run(async () => {
            await deleteQuizAction(quizId);
            setConfirmOpen(false);
          })
        }
      />
    </>
  );
}
