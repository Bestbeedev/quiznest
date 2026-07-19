import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Nouveau mot de passe",
  description:
    "Définissez un nouveau mot de passe pour votre compte QuizNest et retrouvez l'accès à votre espace.",
  path: "/reset-password",
  noindex: true,
});

export default async function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
