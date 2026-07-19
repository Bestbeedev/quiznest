import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/features/authentication/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié — QuizNest",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
