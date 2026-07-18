"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Table } from "@tanstack/react-table";
import { Archive, Copy, Send, Trash2 } from "lucide-react";

import {
  bulkArchiveQuizzesAction,
  bulkDeleteQuizzesAction,
  bulkDuplicateQuizzesAction,
  bulkPublishQuizzesAction,
} from "@/features/quiz/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { QuizRow } from "@/features/quiz/components/quiz-columns";

export function QuizBulkActions({ table }: { table: Table<QuizRow> }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  const run = (action: (ids: string[]) => Promise<{ count: number }>) => {
    startTransition(async () => {
      await action(selectedIds);
      table.resetRowSelection();
      router.refresh();
    });
  };

  return (
    <>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(bulkPublishQuizzesAction)}
        >
          <Send className="size-3.5" />
          Publier
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(bulkArchiveQuizzesAction)}
        >
          <Archive className="size-3.5" />
          Archiver
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(bulkDuplicateQuizzesAction)}
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
        title={`Supprimer ${selectedIds.length} quiz ?`}
        description="Cette action est irréversible. Les quiz sélectionnés et leurs questions seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={isPending}
        onConfirm={() =>
          run(async (ids) => {
            const result = await bulkDeleteQuizzesAction(ids);
            setConfirmOpen(false);
            return result;
          })
        }
      />
    </>
  );
}
