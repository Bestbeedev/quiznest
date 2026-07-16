"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import { signIn } from "@/lib/auth/client";
import { signInSchema, type SignInInput } from "@/lib/validators/auth";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = signInSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const { error } = await signIn.email(parsed.data);

    if (error) {
      setServerError(error.message ?? "Email ou mot de passe incorrect.");
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre espace QuizNest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/register" className="text-primary underline underline-offset-4">
                  Créer un compte
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
