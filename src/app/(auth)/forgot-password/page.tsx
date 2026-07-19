import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-auth";

export const metadata: Metadata = {
  title: "Mot de passe oublié — QuizNest",
};

export default async function ForgotPasswordPage() {
  await redirectIfAuthenticated();

  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
