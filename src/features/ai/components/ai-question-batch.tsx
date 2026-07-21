"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { importAiQuestionAction } from "@/features/quiz/actions";
import type { AiImportQuestion } from "@/lib/validators/ai-import";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  single_choice: "Choix unique",
  multiple_choice: "Choix multiple",
  true_false: "Vrai / Faux",
  short_answer: "Réponse courte",
};

type QuestionStatus = "idle" | "pending" | "done" | "error";

/** Renders a batch of AI-proposed questions attached to a chat message, with
 * a per-question and "insert all" action wired directly to the existing
 * import pipeline (`importAiQuestionAction` — already feature-gated/metered),
 * so no copy/paste round-trip is needed. */
export function AiQuestionBatch({
  questions,
  quizId,
  onImported,
}: {
  questions: AiImportQuestion[];
  quizId: string | null;
  onImported?: () => void;
}) {
  const [statuses, setStatuses] = useState<QuestionStatus[]>(() => questions.map(() => "idle"));

  const insertOne = async (index: number) => {
    if (!quizId) {
      toast.error("Associez d'abord un quiz à cette conversation.");
      return;
    }
    setStatuses((prev) => prev.map((s, i) => (i === index ? "pending" : s)));
    const result = await importAiQuestionAction(quizId, questions[index]);
    setStatuses((prev) => prev.map((s, i) => (i === index ? (result?.error ? "error" : "done") : s)));
    if (result?.error) {
      toast.error(result.error);
    } else {
      onImported?.();
    }
  };

  const insertAll = async () => {
    if (!quizId) {
      toast.error("Associez d'abord un quiz à cette conversation.");
      return;
    }
    let succeeded = 0;
    for (let i = 0; i < questions.length; i++) {
      if (statuses[i] === "done") continue;
      await insertOne(i);
      succeeded++;
    }
    if (succeeded > 0) toast.success("Questions importées dans le quiz.");
  };

  const allDone = statuses.every((s) => s === "done");

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {questions.length} question(s) proposée(s)
        </p>
        <Button type="button" size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={insertAll} disabled={allDone}>
          <ListChecks className="size-3.5" />
          {allDone ? "Toutes importées" : "Tout insérer"}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {questions.map((question, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-xs",
              statuses[index] === "error" && "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{question.question}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {TYPE_LABELS[question.type] ?? question.type}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {question.points} pt(s)
                </Badge>
              </div>
            </div>

            {statuses[index] === "pending" && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
            {statuses[index] === "done" && <CheckCircle2 className="size-4 shrink-0 text-primary" />}
            {(statuses[index] === "idle" || statuses[index] === "error") && (
              <Button type="button" size="sm" variant="ghost" className="h-6 shrink-0 px-2 text-[11px]" onClick={() => insertOne(index)}>
                Insérer
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
