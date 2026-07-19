import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/authentication/components/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-auth";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Connexion",
  description:
    "Connectez-vous à QuizNest pour gérer vos quiz, analyser les résultats et créer de nouvelles évaluations en quelques clics.",
  path: "/login",
  keywords: [
    "connexion quiz",
    "login quiznest",
    "se connecter plateforme quiz",
    "espace personnel quiz",
    "mon compte quiz",
  ],
});

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
