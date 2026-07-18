"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Eye, History, PlayCircle, XCircle } from "lucide-react";

import { getParticipantAnswersAction } from "@/features/quiz/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDuration } from "@/lib/format";
import type { ParticipantStatus } from "@/generated/prisma/client";

type AnswerDetail = {
  id: string;
  isCorrect: boolean;
  choiceIds: string[];
  text: string | null;
  question: {
    title: string;
    explanation: string | null;
    choices: { id: string; text: string; isCorrect: boolean }[];
  };
};

type ParticipantSummary = {
  status: ParticipantStatus;
  percentage: number;
  passed: boolean;
  score: number;
  startedAt: Date | string;
  completedAt: Date | string | null;
  timeSpent: number | null;
};

type HistoryAttempt = {
  id: string;
  attempt: number;
  status: ParticipantStatus;
  percentage: number;
  passed: boolean;
  startedAt: Date | string;
  completedAt: Date | string | null;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

const STATUS_LABELS: Record<ParticipantStatus, string> = {
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  ABANDONED: "Abandonné",
};

export function ParticipantAnswersDialog({
  quizId,
  participantId,
  participantName,
}: {
  quizId: string;
  participantId: string;
  participantName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<ParticipantSummary | null>(null);
  const [answers, setAnswers] = useState<AnswerDetail[] | null>(null);
  const [history, setHistory] = useState<HistoryAttempt[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    if (answers !== null) return;
    setLoading(true);
    setError(null);
    getParticipantAnswersAction(quizId, participantId)
      .then((result) => {
        setParticipant(result.participant as unknown as ParticipantSummary);
        setAnswers(result.answers as unknown as AnswerDetail[]);
        setHistory(result.history as unknown as HistoryAttempt[]);
      })
      .catch(() => setError("Impossible de charger le détail des réponses."))
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={handleOpen} aria-label="Voir le détail">
        <Eye className="size-4" />
      </Button>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Détail du participant</DialogTitle>
          <DialogDescription>{participantName}</DialogDescription>
        </DialogHeader>

        {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {participant && (
          <div className="flex flex-col gap-4">
            {/* Score + timeline */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg border p-2.5 text-center">
                <p className="text-lg font-semibold">{participant.percentage}%</p>
                <p className="text-[11px] text-muted-foreground">Score</p>
              </div>
              <div className="rounded-lg border p-2.5 text-center">
                <Badge variant={participant.status === "COMPLETED" ? (participant.passed ? "default" : "outline") : "secondary"}>
                  {STATUS_LABELS[participant.status]}
                </Badge>
                <p className="mt-1 text-[11px] text-muted-foreground">Statut</p>
              </div>
              <div className="rounded-lg border p-2.5 text-center">
                <p className="text-lg font-semibold">
                  {participant.timeSpent === null ? "—" : formatDuration(participant.timeSpent)}
                </p>
                <p className="text-[11px] text-muted-foreground">Durée</p>
              </div>
              <div className="rounded-lg border p-2.5 text-center">
                <p className="text-lg font-semibold">{participant.score}</p>
                <p className="text-[11px] text-muted-foreground">Points</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-l-2 border-muted pl-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <PlayCircle className="size-3.5" />
                Démarré le {dateFormatter.format(new Date(participant.startedAt))}
              </div>
              {participant.completedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" />
                  Terminé le {dateFormatter.format(new Date(participant.completedAt))}
                </div>
              )}
            </div>

            {history && history.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                    <History className="size-3.5" />
                    Historique ({history.length} autre{history.length !== 1 ? "s" : ""} tentative{history.length !== 1 ? "s" : ""})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {history.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5 text-xs"
                      >
                        <span>
                          Tentative {attempt.attempt} — {dateFormatter.format(new Date(attempt.startedAt))}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {attempt.status === "COMPLETED" ? `${attempt.percentage}%` : STATUS_LABELS[attempt.status]}
                          {attempt.status === "COMPLETED" &&
                            (attempt.passed ? (
                              <CheckCircle2 className="size-3.5 text-primary" />
                            ) : (
                              <XCircle className="size-3.5 text-destructive" />
                            ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Réponses</p>
              {answers?.map((answer, index) => (
                <div key={answer.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      {index + 1}. {answer.question.title}
                    </p>
                    {answer.isCorrect ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-destructive" />
                    )}
                  </div>

                  {answer.text !== null ? (
                    <p className="mt-2 rounded-md bg-muted/50 p-2 text-sm">{answer.text}</p>
                  ) : (
                    <ul className="mt-2 flex flex-col gap-1 text-sm">
                      {answer.question.choices.map((choice) => {
                        const isSelected = answer.choiceIds.includes(choice.id);
                        return (
                          <li
                            key={choice.id}
                            className={
                              choice.isCorrect
                                ? "font-medium text-foreground"
                                : isSelected
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }
                          >
                            {choice.isCorrect ? "✓ " : isSelected ? "✗ " : "— "}
                            {choice.text}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {answer.question.explanation && (
                    <p className="mt-2 text-xs text-muted-foreground">{answer.question.explanation}</p>
                  )}
                </div>
              ))}

              {answers?.length === 0 && (
                <Badge variant="secondary" className="w-fit">
                  Aucune réponse enregistrée
                </Badge>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
