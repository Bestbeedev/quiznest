"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Copy, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  const run = (action: () => Promise<void>, message: string) => {
    startTransition(async () => {
      await action();
      router.refresh();
      toast.success(message);
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
          <DropdownMenuItem onClick={() => run(() => duplicateQuizAction(quizId), "Quiz dupliqué.")}>
            <Copy />
            Dupliquer
          </DropdownMenuItem>
          {status === "DRAFT" && (
            <DropdownMenuItem onClick={() => run(() => publishQuizAction(quizId), "Quiz publié.")}>
              <Send />
              Publier
            </DropdownMenuItem>
          )}
          {status === "PUBLISHED" && (
            <DropdownMenuItem onClick={() => run(() => archiveQuizAction(quizId), "Quiz archivé.")}>
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
          }, "Quiz supprimé.")
        }
      />
    </>
  );
}
