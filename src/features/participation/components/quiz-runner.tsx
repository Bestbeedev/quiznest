"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Timer, AlertTriangle, Shield, CheckCircle2, CircleDot, Copy, ToggleLeft } from "lucide-react";
import { toast } from "sonner";

import { submitAttemptAction } from "@/features/participation/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAntiCheat } from "@/features/participation/hooks/use-anti-cheat";

type PlayQuestion = {
  id: string;
  title: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  points: number;
  hint: string | null;
  timeLimit: number | null;
  choices: { id: string; text: string }[];
};

const TYPE_CONFIG: Record<
  PlayQuestion["type"],
  { label: string; help: string; icon: typeof CircleDot; color: string }
> = {
  SINGLE_CHOICE: {
    label: "Choix unique",
    help: "Sélectionnez une seule réponse",
    icon: CircleDot,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  MULTIPLE_CHOICE: {
    label: "Choix multiple",
    help: "Sélectionnez toutes les réponses correctes",
    icon: Copy,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  },
  TRUE_FALSE: {
    label: "Vrai ou Faux",
    help: "Choisissez Vrai ou Faux",
    icon: ToggleLeft,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  SHORT_ANSWER: {
    label: "Réponse courte",
    help: "Entrez votre réponse",
    icon: CheckCircle2,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -32 : 32, opacity: 0 }),
};

export function QuizRunner({
  accessCode,
  quizId,
  participantId,
  quizTitle,
  quizTimeLimit,
  fullscreen,
  passingScore,
  questions,
}: {
  accessCode: string;
  quizId: string;
  participantId: string;
  quizTitle: string;
  quizTimeLimit: number | null;
  fullscreen: boolean;
  passingScore: number;
  questions: PlayQuestion[];
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overallSecondsLeft, setOverallSecondsLeft] = useState(
    quizTimeLimit ? quizTimeLimit * 60 : null,
  );

  const {
    violations,
    violationMessage,
    isFullscreen,
    setOnSubmit,
    requestFullscreen,
    violationLimit,
  } = useAntiCheat({ enabled: true });

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const singleAnswer = question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE";
  const selected = answers[question.id] ?? [];
  const typeConfig = TYPE_CONFIG[question.type];
  const TypeIcon = typeConfig.icon;

  const [questionSecondsLeft, setQuestionSecondsLeft] = useState(question.timeLimit);
  const [trackedQuestionId, setTrackedQuestionId] = useState(question.id);
  if (question.id !== trackedQuestionId) {
    setTrackedQuestionId(question.id);
    setQuestionSecondsLeft(question.timeLimit);
  }

  const questionStartRef = useRef<number | null>(null);
  const questionTimesRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const questionId = question.id;
    questionStartRef.current = Date.now();
    const timesRef = questionTimesRef;
    return () => {
      const startedAt = questionStartRef.current;
      const elapsed = startedAt === null ? 0 : Math.round((Date.now() - startedAt) / 1000);
      timesRef.current[questionId] = (timesRef.current[questionId] ?? 0) + elapsed;
    };
  }, [question.id]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const elapsed =
      questionStartRef.current === null ? 0 : Math.round((Date.now() - questionStartRef.current) / 1000);
    const finalTimes = {
      ...questionTimesRef.current,
      [question.id]: (questionTimesRef.current[question.id] ?? 0) + elapsed,
    };

    const payload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        choiceIds: answers[q.id] ?? [],
        timeSpent: finalTimes[q.id] ?? 0,
      })),
    };

    const result = await submitAttemptAction(accessCode, quizId, participantId, payload);
    setIsSubmitting(false);
    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    }
  };

  useEffect(() => {
    setOnSubmit(handleSubmit);
  });

  const goNext = () => {
    setDirection(1);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  const goPrevious = () => {
    setDirection(-1);
    setIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  });
  const goNextRef = useRef(goNext);
  useEffect(() => {
    goNextRef.current = goNext;
  });

  useEffect(() => {
    if (quizTimeLimit === null) return;
    const id = setInterval(() => {
      setOverallSecondsLeft((s) => (s !== null && s > 0 ? s - 1 : s));
    }, 1000);
    return () => clearInterval(id);
  }, [quizTimeLimit]);

  useEffect(() => {
    if (overallSecondsLeft === 0) handleSubmitRef.current();
  }, [overallSecondsLeft]);

  useEffect(() => {
    if (question.timeLimit === null) return;
    const id = setInterval(() => {
      setQuestionSecondsLeft((s) => (s !== null && s > 0 ? s - 1 : s));
    }, 1000);
    return () => clearInterval(id);
  }, [question.id, question.timeLimit]);

  useEffect(() => {
    if (questionSecondsLeft === 0) {
      if (isLast) handleSubmitRef.current();
      else goNextRef.current();
    }
  }, [questionSecondsLeft, isLast]);

  useEffect(() => {
    if (fullscreen && !isFullscreen) {
      requestFullscreen();
    }
  }, [fullscreen, isFullscreen, requestFullscreen]);

  const toggleChoice = (choiceId: string) => {
    setAnswers((prev) => {
      const current = prev[question.id] ?? [];
      if (singleAnswer) {
        return { ...prev, [question.id]: [choiceId] };
      }
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...prev, [question.id]: next };
    });
  };

  return (
    <div className="quiz-anti-cheat flex flex-col gap-4">
      {violationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert variant="destructive" className="gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <AlertDescription className="font-medium">{violationMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight">{quizTitle}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Shield className="size-3" />
            {violations}/{violationLimit}
          </Badge>
          {overallSecondsLeft !== null && (
            <Badge
              variant={overallSecondsLeft <= 30 ? "destructive" : "outline"}
              className="gap-1.5 tabular-nums"
            >
              <Clock className="size-3.5" />
              {formatClock(overallSecondsLeft)}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {questions.length} question{questions.length !== 1 ? "s" : ""}
        </span>
        <span>·</span>
        <span>Score pour passer : {passingScore}%</span>
        {quizTimeLimit && (
          <>
            <span>·</span>
            <span>Temps total : {quizTimeLimit} min</span>
          </>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary">
              Question {index + 1} / {questions.length}
            </Badge>
            <div className="flex items-center gap-2">
              {questionSecondsLeft !== null && (
                <Badge
                  variant={questionSecondsLeft <= 5 ? "destructive" : "outline"}
                  className="gap-1.5 tabular-nums"
                >
                  <Timer className="size-3.5" />
                  {formatClock(questionSecondsLeft)}
                </Badge>
              )}
              <Badge variant="outline">
                {question.points} pt{question.points !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("gap-1.5 border", typeConfig.color)}>
                  <TypeIcon className="size-3.5" />
                  {typeConfig.label}
                </Badge>
              </div>

              <CardTitle>{question.title}</CardTitle>

              <p className="text-xs text-muted-foreground">{typeConfig.help}</p>

              <div className="flex flex-col gap-2">
                {question.choices.map((choice) => (
                  <label
                    key={choice.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                      selected.includes(choice.id) && "border-primary/50 bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={selected.includes(choice.id)}
                      onCheckedChange={() => toggleChoice(choice.id)}
                    />
                    {choice.text}
                  </label>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" disabled={index === 0} onClick={goPrevious}>
              Précédent
            </Button>

            {isLast ? (
              <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? "Envoi..." : "Terminer"}
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
