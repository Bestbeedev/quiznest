import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, FileText, Copy, CheckCircle2 } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listQuizzes } from "@/lib/services/quiz";
import { getOrganizationSubscription } from "@/lib/services/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { UpgradeBanner } from "@/features/dashboard/components/upgrade-banner";

export const metadata: Metadata = {
  title: "IA — QuizNest",
};

export default async function AiPage() {
  const organization = await requireActiveOrganization();
  const [quizzes, subscription] = await Promise.all([
    listQuizzes(organization.id),
    getOrganizationSubscription(organization.id),
  ]);

  const plan = subscription?.plan;
  const isFree = plan?.slug === "free";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Génération par IA</h1>
        <p className="text-sm text-muted-foreground">
          Générez des questions de quiz en quelques secondes avec l&apos;intelligence artificielle.
        </p>
      </div>

      {isFree && (
        <UpgradeBanner
          title="Débloquez l'IA Premium"
          description="Générez des questions automatiquement sans quitter la plateforme. Plus besoin de copier-coller dans ChatGPT."
          variant="card"
          features={[
            "Génération directe dans l'app",
            "Questions illimitées",
            "Tous les types de questions",
            "Support prioritaire",
          ]}
          icon={Sparkles}
          ctaLabel="Passer au Professional"
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="size-5 text-primary" />
            </div>
            <CardTitle className="mt-3">Comment ça marche ?</CardTitle>
            <CardDescription>3 étapes simples, sans clé API à configurer.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Ouvrez un quiz",
                  desc: "Dans l'onglet Questions, cliquez sur « Générer avec l'IA ».",
                  icon: FileText,
                },
                {
                  step: "2",
                  title: "Copiez le prompt",
                  desc: "Collez-le dans ChatGPT, Claude ou tout autre assistant IA.",
                  icon: Copy,
                },
                {
                  step: "3",
                  title: "Importez les questions",
                  desc: "Collez la réponse de l'IA — les questions sont créées automatiquement.",
                  icon: CheckCircle2,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col gap-2 rounded-lg border p-4"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-5 text-primary" />
            </div>
            <CardTitle className="mt-3">Astuces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium">Soyez précis</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Indiquez le thème, le niveau et le nombre de questions souhaité.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium">Mélangez les types</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Demandez un mix de QCM, vrai/faux et questions ouvertes.
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-medium">Revoyez toujours</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Vérifiez et ajustez les réponses proposées par l&apos;IA avant de publier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {quizzes.length === 0 ? (
        <EmptyStateCard
          icon={Sparkles}
          title="Créez d'abord un quiz"
          description="La génération par IA s'utilise directement depuis un quiz — créez-en un pour commencer."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vos quiz</CardTitle>
            <CardDescription>
              Sélectionnez un quiz pour générer des questions par IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/dashboard/quiz/${quiz.id}`}
                  className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-8 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">
                        {quiz.title}
                      </p>
                      <Badge
                        variant={quiz.status === "PUBLISHED" ? "default" : "secondary"}
                        className="mt-1 text-[10px]"
                      >
                        {quiz.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
