"use client";

import { DataTable } from "@/components/shared/data-table";
import { buildQuestionBankColumns, type QuestionBankRow } from "@/features/quiz/components/question-bank-columns";
import { QuestionBankToolbar } from "@/features/quiz/components/question-bank-toolbar";
import { QuestionBankBulkActions } from "@/features/quiz/components/question-bank-bulk-actions";
import { QuestionBankDropZone } from "@/features/quiz/components/question-bank-drop-zone";

export function QuestionBankView({
  questions,
  quizzes,
}: {
  questions: QuestionBankRow[];
  quizzes: { id: string; title: string }[];
}) {
  const columns = buildQuestionBankColumns(quizzes);

  return (
    <div className="flex flex-col gap-4">
      <QuestionBankDropZone quizzes={quizzes} />

      <DataTable
        columns={columns}
        data={questions}
        searchColumn="title"
        searchPlaceholder="Rechercher une question..."
        enableRowSelection
        enableColumnVisibility
        toolbar={(table) => <QuestionBankToolbar table={table} questions={questions} />}
        bulkActionsBar={(table) => <QuestionBankBulkActions table={table} quizzes={quizzes} />}
      />
    </div>
  );
}
