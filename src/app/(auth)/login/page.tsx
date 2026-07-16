import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/authentication/components/login-form";

export const metadata: Metadata = {
  title: "Connexion — QuizNest",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
