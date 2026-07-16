import type { Metadata } from "next";
import { RegisterForm } from "@/features/authentication/components/register-form";

export const metadata: Metadata = {
  title: "Créer un compte — QuizNest",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
