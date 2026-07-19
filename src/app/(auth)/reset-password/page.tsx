import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/authentication/components/reset-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe — QuizNest",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
