"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators/auth";
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

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = forgotPasswordSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const { error } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      const message = error.message ?? "Une erreur est survenue.";
      setServerError(message);
      toast.error(message);
      return;
    }

    setSent(true);
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-6 text-center lg:hidden">
        <h1 className="text-xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-muted-foreground">Réinitialisez votre accès</p>
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Indiquez votre email, nous vous envoyons un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {sent ? (
              <Alert>
                <AlertDescription>
                  Si cet email existe dans notre système, un lien de réinitialisation vient de lui être
                  envoyé. Vérifiez votre boîte de réception (et vos spams).
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {serverError && (
                  <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={onSubmit} noValidate>
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        className="pl-8"
                        {...register("email")}
                      />
                    </div>
                    <FieldError errors={[errors.email]} />
                  </Field>

                  <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                    {isSubmitting ? "Envoi..." : "Envoyer le lien"}
                  </Button>
                </form>
              </>
            )}

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Retour à la connexion
            </Link>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
