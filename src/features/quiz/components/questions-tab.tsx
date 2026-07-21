"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Eye,
  ChevronRight,
  Timer,
  Tag,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

import { deleteQuestionAction } from "@/features/quiz/actions";
import { AddQuestionDialog, type QuestionForEdit } from "@/features/quiz/components/add-question-dialog";
import { AiGenerateDialog } from "@/features/quiz/components/ai-generate-dialog";
import { FeatureLockNotice, type FeatureCheckUI } from "@/components/shared/feature-lock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Question, QuestionChoice } from "@/generated/prisma/client";

const TYPE_LABELS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "QCM",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

const TYPE_COLORS: Record<Question["type"], string> = {
  SINGLE_CHOICE: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  MULTIPLE_CHOICE: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  TRUE_FALSE: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  SHORT_ANSWER: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Facile",
  MEDIUM: "Moyen",
  HARD: "Difficile",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  HARD: "bg-red-500/10 text-red-600 dark:text-red-400",
};

type QuestionWithChoices = Question & { choices: QuestionChoice[] };
type ViewMode = "list" | "grid";

export function QuestionsTab({
  quizId,
  quizTitle,
  questions,
  aiGeneration,
}: {
  quizId: string;
  quizTitle: string;
  questions: QuestionWithChoices[];
  aiGeneration: FeatureCheckUI;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [detailQuestion, setDetailQuestion] = useState<QuestionWithChoices | null>(null);

  const handleDelete = useCallback(
    (questionId: string) => {
      startTransition(async () => {
        await deleteQuestionAction(quizId, questionId);
        router.refresh();
        toast.success("Question supprimée.");
      });
    },
    [quizId, router],
  );

  const editingQuestion = questions.find((q) => q.id === editingId);
  const editableQuestion: QuestionForEdit | null = editingQuestion
    ? {
        id: editingQuestion.id,
        title: editingQuestion.title,
        type: editingQuestion.type,
        difficulty: editingQuestion.difficulty,
        points: editingQuestion.points,
        hint: editingQuestion.hint,
        timeLimit: editingQuestion.timeLimit,
        explanation: editingQuestion.explanation,
        category: editingQuestion.category,
        tags: editingQuestion.tags,
        choices: editingQuestion.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })),
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {aiGeneration.allowed ? (
            <AiGenerateDialog quizId={quizId} quizTitle={quizTitle} />
          ) : (
            <FeatureLockNotice label="Générer avec l'IA" reason={aiGeneration.reason} check={aiGeneration} />
          )}
          <AddQuestionDialog quizId={quizId} />
        </div>
      </div>

      {questions.length > 0 && (
        <div className="flex items-center gap-1 self-end rounded-lg border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-3.5" />
            Liste
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-3.5" />
            Grille
          </button>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <HelpCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucune question pour le moment.</p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="flex flex-col gap-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="group flex items-start gap-2.5 rounded-xl border bg-card p-3 sm:p-4 transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{question.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", TYPE_COLORS[question.type])}>
                    {TYPE_LABELS[question.type]}
                  </span>
                  <Badge variant="secondary" className="text-[11px]">
                    {question.points} pt{question.points !== 1 ? "s" : ""}
                  </Badge>
                  {question.difficulty && (
                    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium", DIFFICULTY_COLORS[question.difficulty])}>
                      {DIFFICULTY_LABELS[question.difficulty]}
                    </span>
                  )}
                </div>
                {question.choices.length > 0 && (
                  <div className="mt-2 grid gap-1 sm:grid-cols-2">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-2 py-1 text-[12px]",
                          choice.isCorrect
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        <span className="text-[11px]">
                          {choice.isCorrect ? "✓" : "—"}
                        </span>
                        <span className="truncate">{choice.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDetailQuestion(question)}
                  aria-label="Voir le détail"
                >
                  <Eye className="size-4 text-muted-foreground" />
                </Button>
                <div className="flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setEditingId(question.id)}
                    aria-label="Modifier la question"
                  >
                    <Pencil className="size-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isPending}
                    onClick={() => handleDelete(question.id)}
                    aria-label="Supprimer la question"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              onClick={() => setDetailQuestion(question)}
              className="group flex flex-col gap-2 rounded-xl border bg-card p-3 sm:p-4 text-left transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", TYPE_COLORS[question.type])}>
                    {TYPE_LABELS[question.type]}
                  </span>
                </div>
              </div>

              <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                {question.title}
              </p>

              <div className="mt-auto flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {question.points} pt{question.points !== 1 ? "s" : ""}
                </Badge>
                {question.difficulty && (
                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", DIFFICULTY_COLORS[question.difficulty])}>
                    {DIFFICULTY_LABELS[question.difficulty]}
                  </span>
                )}
                {question.choices.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {question.choices.length} choix
                  </span>
                )}
              </div>

              {question.choices.length > 0 && (
                <div className="flex flex-col gap-1">
                  {question.choices.slice(0, 3).map((choice) => (
                    <div
                      key={choice.id}
                      className={cn(
                        "flex items-center gap-1.5 rounded px-2 py-1 text-xs",
                        choice.isCorrect
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      <span>{choice.isCorrect ? "✓" : "—"}</span>
                      <span className="truncate">{choice.text}</span>
                    </div>
                  ))}
                  {question.choices.length > 3 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{question.choices.length - 3} autre{question.choices.length - 3 !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 pt-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <ChevronRight className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Voir le détail</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailQuestion !== null} onOpenChange={(o) => !o && setDetailQuestion(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailQuestion && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{detailQuestion.title}</SheetTitle>
                <SheetDescription>Détail de la question {detailQuestion ? questions.findIndex((q) => q.id === detailQuestion.id) + 1 : ""}</SheetDescription>
              </SheetHeader>

              <div className="flex flex-col gap-5 px-6 pb-6 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", TYPE_COLORS[detailQuestion.type])}>
                    {TYPE_LABELS[detailQuestion.type]}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {detailQuestion.points} pt{detailQuestion.points !== 1 ? "s" : ""}
                  </Badge>
                  {detailQuestion.difficulty && (
                    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", DIFFICULTY_COLORS[detailQuestion.difficulty])}>
                      {DIFFICULTY_LABELS[detailQuestion.difficulty]}
                    </span>
                  )}
                  {detailQuestion.timeLimit && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="size-3" />
                      {detailQuestion.timeLimit}s
                    </span>
                  )}
                </div>

                {detailQuestion.choices.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Réponses</p>
                    <div className="flex flex-col gap-1.5">
                      {detailQuestion.choices.map((choice, i) => (
                        <div
                          key={choice.id}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg border p-3 text-sm",
                            choice.isCorrect
                              ? "border-emerald-300 bg-emerald-500/10 dark:border-emerald-700"
                              : "border-border",
                          )}
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className={cn("flex-1", choice.isCorrect && "font-medium")}>{choice.text}</span>
                          {choice.isCorrect && (
                            <Badge variant="default" className="text-xs bg-emerald-600 hover:bg-emerald-600">
                              Correcte
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailQuestion.explanation && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Explication</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{detailQuestion.explanation}</p>
                    </div>
                  </>
                )}

                {detailQuestion.hint && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Indice</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{detailQuestion.hint}</p>
                    </div>
                  </>
                )}

                {(detailQuestion.category || detailQuestion.tags.length > 0) && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      {detailQuestion.category && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FolderOpen className="size-3" />
                          <span>{detailQuestion.category}</span>
                        </div>
                      )}
                      {detailQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Tag className="size-3 text-muted-foreground" />
                          {detailQuestion.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailQuestion(null);
                      setEditingId(detailQuestion.id);
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      handleDelete(detailQuestion.id);
                      setDetailQuestion(null);
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {editableQuestion && (
        <AddQuestionDialog
          key={editableQuestion.id}
          quizId={quizId}
          question={editableQuestion}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}
