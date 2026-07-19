"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (!token) {
      setServerError("Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.");
      return;
    }

    const parsed = resetPasswordSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: parsed.data.password,
      token,
    });

    if (error) {
      const message = error.message ?? "Lien invalide ou expiré.";
      setServerError(message);
      toast.error(message);
      return;
    }

    toast.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
    router.push("/login");
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-6 text-center lg:hidden">
        <h1 className="text-xl font-bold tracking-tight">Nouveau mot de passe</h1>
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>Choisissez un nouveau mot de passe pour votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {!token && (
              <Alert variant="destructive">
                <AlertDescription>
                  Lien invalide ou expiré.{" "}
                  <Link href="/forgot-password" className="underline underline-offset-4">
                    Demandez un nouveau lien
                  </Link>
                  .
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-4">
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      className="pl-8"
                      {...register("password")}
                    />
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>

                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      className="pl-8"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              </div>

              <Button type="submit" disabled={isSubmitting || !token} className="mt-4 w-full">
                {isSubmitting ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </Button>
            </form>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
