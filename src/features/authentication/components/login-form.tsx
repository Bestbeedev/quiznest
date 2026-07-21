"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth/client";
import { signInSchema, type SignInInput } from "@/lib/validators/auth";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { getPostLoginRedirect } from "@/features/authentication/actions";
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

import { ChromeIcon } from "@/components/ui/icons/chrome-icon";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSSOLoading, setIsSSOLoading] = useState(false);

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
      const message = error.message ?? "Email ou mot de passe incorrect.";
      setServerError(message);
      toast.error(message);
      return;
    }

    router.push(await getPostLoginRedirect(searchParams.get("callbackUrl")));
    router.refresh();
  });

  const handleGoogleSignIn = async () => {
    setIsSSOLoading(true);
    setServerError(null);
    const { error } = await signIn.social({ provider: "google" });
    if (error) {
      const message = error.message ?? "Erreur lors de la connexion avec Google.";
      setServerError(message);
      toast.error(message);
      setIsSSOLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="mb-6 text-center lg:hidden">
        <h1 className="text-xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accédez à votre espace</p>
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre espace QuizNest.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isSSOLoading}
              onClick={handleGoogleSignIn}
            >
              <ChromeIcon className="size-4" />
              {isSSOLoading ? "Connexion..." : "Continuer avec Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <form onSubmit={onSubmit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
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

                <Field data-invalid={!!errors.password}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      className="pl-8"
                      {...register("password")}
                    />
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>
              </div>

              <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium text-primary underline underline-offset-4">
                Créer un compte
              </Link>
            </p>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
