import type { Metadata } from "next";
import {
  Clock,
  HelpCircle,
  Repeat,
  Shield,
  AlertTriangle,
  MonitorOff,
  CopyOff,
  MousePointerClick,
  Maximize,
  CheckCircle2,
  CircleDot,
  Copy,
  ToggleLeft,
} from "lucide-react";

import { getPublicQuiz } from "@/lib/services/participation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StartAttemptForm } from "@/features/participation/components/start-attempt-form";
import { Reveal } from "@/components/shared/reveal";

export const metadata: Metadata = {
  title: "Participer — QuizNest",
};

const QUESTION_TYPE_ICONS: Record<string, typeof CircleDot> = {
  SINGLE_CHOICE: CircleDot,
  MULTIPLE_CHOICE: Copy,
  TRUE_FALSE: ToggleLeft,
  SHORT_ANSWER: CheckCircle2,
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Choix unique",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
  SHORT_ANSWER: "Réponse courte",
};

const RULES = [
  {
    icon: MonitorOff,
    text: "Ne quittez pas l'onglet du quiz",
    detail: "Changer d'onglet ou d'application est détecté",
  },
  {
    icon: CopyOff,
    text: "Copier/coller désactivé",
    detail: "Les raccourcis Ctrl+C, Ctrl+V, etc. sont bloqués",
  },
  {
    icon: MousePointerClick,
    text: "Clic droit désactivé",
    detail: "Le menu contextuel est bloqué pendant le quiz",
  },
  {
    icon: AlertTriangle,
    text: "Raccourcis clavier bloqués",
    detail: "F12, Ctrl+U, Ctrl+Shift+I et autres outils de développement",
  },
  {
    icon: Maximize,
    text: "Mode plein écran",
    detail: "Le quiz peut forcer le mode plein écran",
  },
];

export default async function PublicQuizPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const quiz = await getPublicQuiz(code);

  if (!quiz) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz introuvable</CardTitle>
          <CardDescription>
            Ce quiz n&apos;existe pas, n&apos;est plus disponible, ou n&apos;a pas encore été
            publié.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const questionTypes = [...new Set(quiz.questions.map((q) => q.type))];

  return (
    <Reveal direction="scale">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
              {quiz.organization.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quiz.organization.logo}
                  alt={quiz.organization.name}
                  className="size-5 shrink-0 rounded object-cover"
                />
              ) : null}
              <span>Organisé par {quiz.organization.name}</span>
            </div>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center">
                <HelpCircle className="size-5 text-muted-foreground" />
                <span className="text-lg font-semibold">{quiz._count.questions}</span>
                <span className="text-xs text-muted-foreground">
                  Question{quiz._count.questions !== 1 ? "s" : ""}
                </span>
              </div>
              {quiz.timeLimit && (
                <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center">
                  <Clock className="size-5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{quiz.timeLimit}</span>
                  <span className="text-xs text-muted-foreground">Minutes</span>
                </div>
              )}
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center">
                <Repeat className="size-5 text-muted-foreground" />
                <span className="text-lg font-semibold">{quiz.attempts}</span>
                <span className="text-xs text-muted-foreground">
                  Tentative{quiz.attempts !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 p-3 text-center">
                <CheckCircle2 className="size-5 text-muted-foreground" />
                <span className="text-lg font-semibold">{quiz.passingScore}%</span>
                <span className="text-xs text-muted-foreground">Pour passer</span>
              </div>
            </div>

            {questionTypes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Types de questions
                </span>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1.5">
                      {QUESTION_TYPE_ICONS[type] &&
                        (() => {
                          const Icon = QUESTION_TYPE_ICONS[type];
                          return <Icon className="size-3.5" />;
                        })()}
                      {QUESTION_TYPE_LABELS[type] ?? type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {quiz.fullscreen && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                <Maximize className="size-4 shrink-0" />
                Ce quiz nécessite le mode plein écran
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-5 text-destructive" />
              Règles anti-triche
            </CardTitle>
            <CardDescription>
              Ces mesures de sécurité s&apos;appliquent pendant toute la durée du quiz.
              Toute violation est enregistrée et peut entraîner la soumission automatique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {RULES.map((rule) => (
                <div
                  key={rule.text}
                  className="flex items-start gap-2.5 rounded-lg border bg-background/50 p-2.5"
                >
                  <rule.icon className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{rule.text}</span>
                    <span className="text-xs text-muted-foreground">{rule.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <StartAttemptForm accessCode={code} />
          </CardContent>
        </Card>
      </div>
    </Reveal>
  );
}
