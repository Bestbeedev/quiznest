"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type PreviewQuestion = {
  title: string;
  points: number;
  explanation: string | null;
  choices: { id: string; text: string; isCorrect: boolean }[];
};

/** Read-only, static rendering — this is the organizer's view (correct answers
 * shown), not the participant runner, so it deliberately doesn't reuse
 * `QuizRunner` (which hides correctness and drives a real attempt). */
export function QuestionPreviewDialog({ question }: { question: PreviewQuestion }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Prévisualiser">
        <Eye className="size-4" />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">{question.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Badge variant="outline" className="w-fit">
            {question.points} pt{question.points !== 1 ? "s" : ""}
          </Badge>

          <ul className="flex flex-col gap-2">
            {question.choices.map((choice) => (
              <li
                key={choice.id}
                className={
                  choice.isCorrect
                    ? "rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium"
                    : "rounded-lg border px-3 py-2 text-sm text-muted-foreground"
                }
              >
                {choice.isCorrect ? "✓ " : "— "}
                {choice.text}
              </li>
            ))}
          </ul>

          {question.explanation && (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Explication : </span>
              {question.explanation}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
