import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-auth";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Mot de passe oublié",
  description:
    "Réinitialisez votre mot de passe QuizNest. Un lien de récovery vous sera envoyé par email pour accéder à votre espace.",
  path: "/forgot-password",
  noindex: true,
});

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
