import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/authentication/components/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/redirect-if-auth";

export const metadata: Metadata = {
  title: "Connexion — QuizNest",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
