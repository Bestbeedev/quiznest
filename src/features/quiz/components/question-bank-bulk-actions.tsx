"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Table } from "@tanstack/react-table";
import { Copy, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  bulkDeleteQuestionsAction,
  bulkDuplicateQuestionsAction,
  bulkMoveQuestionsAction,
} from "@/features/quiz/actions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { QuestionBankRow } from "@/features/quiz/components/question-bank-columns";

export function QuestionBankBulkActions({
  table,
  quizzes,
}: {
  table: Table<QuestionBankRow>;
  quizzes: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetQuizId, setTargetQuizId] = useState<string>("");

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  const run = async (
    action: (ids: string[]) => Promise<{ count: number } | { error: string }>,
    message: (count: number) => string,
  ) => {
    startTransition(async () => {
      const result = await action(selectedIds);
      table.resetRowSelection();
      router.refresh();
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(message(result.count));
      }
    });
  };

  return (
    <>
      <div className="ml-auto flex items-center gap-1.5">
        <Select value={targetQuizId} onValueChange={(v) => v && setTargetQuizId(v)} items={quizzes.map((quiz) => ({ value: quiz.id, label: quiz.title }))}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Quiz cible..." />
          </SelectTrigger>
          <SelectContent>
            {quizzes.map((quiz) => (
              <SelectItem key={quiz.id} value={quiz.id}>
                {quiz.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || !targetQuizId}
          onClick={() =>
            run(
              (ids) => bulkMoveQuestionsAction(ids, targetQuizId),
              (count) => `${count} question(s) déplacée(s).`,
            )
          }
        >
          <Send className="size-3.5" />
          Déplacer
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending || !targetQuizId}
          onClick={() =>
            run(
              (ids) => bulkDuplicateQuestionsAction(ids, targetQuizId),
              (count) => `${count} question(s) dupliquée(s).`,
            )
          }
        >
          <Copy className="size-3.5" />
          Dupliquer
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-3.5" />
          Supprimer
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Supprimer ${selectedIds.length} question(s) ?`}
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={() =>
          run(
            async (ids) => {
              const result = await bulkDeleteQuestionsAction(ids);
              setConfirmOpen(false);
              return result;
            },
            (count) => `${count} question(s) supprimée(s).`,
          )
        }
      />
    </>
  );
}
