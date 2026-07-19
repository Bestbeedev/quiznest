"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";

import { moveQuestionAction } from "@/features/quiz/actions";
import { cn } from "@/lib/utils";

export const QUESTION_DRAG_MIME = "application/x-question-id";

/** Native HTML5 drag-and-drop (no dnd-kit needed) — a question row's drag
 * handle sets `dataTransfer`, these cards accept the drop and move the
 * question into that quiz. Kept as its own strip rather than wiring
 * dnd-kit through the shared `DataTable` (used by 8+ other pages). */
export function QuestionBankDropZone({ quizzes }: { quizzes: { id: string; title: string }[] }) {
  const router = useRouter();
  const [overQuizId, setOverQuizId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (quizzes.length === 0) return null;

  const handleDrop = async (quizId: string, quizTitle: string, event: React.DragEvent) => {
    event.preventDefault();
    setOverQuizId(null);
    const questionId = event.dataTransfer.getData(QUESTION_DRAG_MIME);
    if (!questionId) return;

    setBusy(true);
    await moveQuestionAction(questionId, quizId);
    setBusy(false);
    toast.success(`Question déplacée vers "${quizTitle}".`);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Glissez une question sur un quiz ci-dessous pour la déplacer.
      </p>
      <div className="flex flex-wrap gap-2">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverQuizId(quiz.id);
            }}
            onDragLeave={() => setOverQuizId((current) => (current === quiz.id ? null : current))}
            onDrop={(e) => handleDrop(quiz.id, quiz.title, e)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm text-muted-foreground transition-colors",
              overQuizId === quiz.id && "border-primary bg-primary/5 text-foreground",
              busy && "pointer-events-none opacity-50",
            )}
          >
            <ListChecks className="size-3.5" />
            {quiz.title}
          </div>
        ))}
      </div>
    </div>
  );
}
