"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteQuestionAction, duplicateQuestionAction, moveQuestionAction } from "@/features/quiz/actions";
import { AddQuestionDialog, type QuestionForEdit } from "@/features/quiz/components/add-question-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

export function QuestionBankRowActions({
  questionId,
  quizId,
  editableQuestion,
  otherQuizzes,
}: {
  questionId: string;
  quizId: string;
  editableQuestion: QuestionForEdit;
  otherQuizzes: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);

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
          <DropdownMenuItem onClick={() => setEditing(true)}>
            <Pencil />
            Modifier
          </DropdownMenuItem>

          {otherQuizzes.length > 0 && (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Copy />
                  Dupliquer vers
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {otherQuizzes.map((quiz) => (
                    <DropdownMenuItem
                      key={quiz.id}
                      onClick={() =>
                        run(
                          () => duplicateQuestionAction(questionId, quiz.id),
                          `Question dupliquée vers "${quiz.title}".`,
                        )
                      }
                    >
                      {quiz.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Send />
                  Déplacer vers
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {otherQuizzes.map((quiz) => (
                    <DropdownMenuItem
                      key={quiz.id}
                      onClick={() =>
                        run(
                          () => moveQuestionAction(questionId, quiz.id),
                          `Question déplacée vers "${quiz.title}".`,
                        )
                      }
                    >
                      {quiz.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editing && (
        <AddQuestionDialog
          key={questionId}
          quizId={quizId}
          question={editableQuestion}
          onClose={() => setEditing(false)}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cette question ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={() =>
          run(async () => {
            await deleteQuestionAction(quizId, questionId);
            setConfirmOpen(false);
          }, "Question supprimée.")
        }
      />
    </>
  );
}
