import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPublicQuiz, getQuizForPlay } from "@/lib/services/participation";
import { prisma } from "@/lib/db/client";
import { QuizRunner } from "@/features/participation/components/quiz-runner";
import { buildMetadata } from "@/constants/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  return buildMetadata({
    title: "Passation du quiz",
    description: "Répondez aux questions du quiz en temps limité.",
    noindex: true,
  });
}

export default async function PlayQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ pid?: string }>;
}) {
  const { code } = await params;
  const { pid } = await searchParams;

  const quiz = await getPublicQuiz(code);
  if (!quiz || !pid) {
    notFound();
  }

  const participant = await prisma.participant.findFirst({
    where: { id: pid, quizId: quiz.id },
  });

  if (!participant) {
    notFound();
  }

  if (participant.status === "COMPLETED") {
    redirect(`/q/${code}/result?pid=${pid}`);
  }

  const quizWithQuestions = await getQuizForPlay(quiz.id);

  if (quizWithQuestions.questions.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Ce quiz ne contient aucune question pour le moment.
      </p>
    );
  }

  return (
    <QuizRunner
      accessCode={code}
      quizId={quiz.id}
      participantId={pid}
      quizTitle={quizWithQuestions.title}
      quizTimeLimit={quizWithQuestions.timeLimit}
      fullscreen={quizWithQuestions.fullscreen}
      passingScore={quizWithQuestions.passingScore}
      questions={quizWithQuestions.questions}
    />
  );
}
