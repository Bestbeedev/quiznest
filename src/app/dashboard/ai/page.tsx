import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { listQuizzes } from "@/lib/services/quiz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "IA — QuizNest",
};

export default async function AiPage() {
  const organization = await requireActiveOrganization();
  const quizzes = await listQuizzes(organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Génération par IA</h1>
        <p className="text-sm text-muted-foreground">
          Copiez un prompt prêt à l&apos;emploi dans votre assistant IA préféré, puis collez sa
          réponse pour générer automatiquement les questions d&apos;un quiz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
          <CardDescription>3 étapes, sans clé API à configurer.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="flex flex-col gap-3 text-sm">
            <li>
              <span className="font-medium">1. Ouvrez un quiz</span> — dans l&apos;onglet
              &laquo;&nbsp;Questions&nbsp;&raquo;, cliquez sur &laquo;&nbsp;Générer avec l&apos;IA&nbsp;&raquo;.
            </li>
            <li>
              <span className="font-medium">2. Copiez le prompt</span> et collez-le dans ChatGPT,
              Claude ou tout autre assistant IA.
            </li>
            <li>
              <span className="font-medium">3. Collez la réponse</span> dans QuizNest — les
              questions sont importées automatiquement dans votre quiz.
            </li>
          </ol>
        </CardContent>
      </Card>

      {quizzes.length === 0 ? (
        <EmptyStateCard
          icon={Sparkles}
          title="Créez d'abord un quiz"
          description="La génération par IA s'utilise directement depuis un quiz — créez-en un pour commencer."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vos quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y">
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="font-medium">{quiz.title}</span>
                  <Link
                    href={`/dashboard/quiz/${quiz.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Ouvrir
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
