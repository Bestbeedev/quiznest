"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { signUp, signIn } from "@/lib/auth/client";
import { signUpSchema, type SignUpInput } from "@/lib/validators/auth";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

const iconProps = "pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSSOLoading, setIsSSOLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const { error } = await signUp.email({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
    });

    if (error) {
      const message = error.message ?? "Impossible de créer le compte.";
      setServerError(message);
      toast.error(message);
      return;
    }

    router.push(searchParams.get("callbackUrl") ?? "/dashboard");
    router.refresh();
  });

  const handleGoogleSignUp = async () => {
    setIsSSOLoading(true);
    setServerError(null);
    const { error } = await signIn.social({ provider: "google" });
    if (error) {
      const message = error.message ?? "Erreur lors de l'inscription avec Google.";
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
        <h1 className="text-xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">Commencez gratuitement</p>
      </div>

      <Card className="border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Commencez gratuitement avec QuizNest.</CardDescription>
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
              onClick={handleGoogleSignUp}
            >
              <ChromeIcon className="size-4" />
              {isSSOLoading ? "Inscription..." : "Continuer avec Google"}
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
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                  <div className="relative">
                    <User className={iconProps} />
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      autoComplete="given-name"
                      aria-invalid={!!errors.firstName}
                      className="pl-8"
                      {...register("firstName")}
                    />
                  </div>
                  <FieldError errors={[errors.firstName]} />
                </Field>

                <Field data-invalid={!!errors.lastName}>
                  <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                  <div className="relative">
                    <UserCheck className={iconProps} />
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      autoComplete="family-name"
                      aria-invalid={!!errors.lastName}
                      className="pl-8"
                      {...register("lastName")}
                    />
                  </div>
                  <FieldError errors={[errors.lastName]} />
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className={iconProps} />
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
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <div className="relative">
                    <Lock className={iconProps} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="8 caractères minimum"
                      autoComplete="new-password"
                      aria-invalid={!!errors.password}
                      className="pl-8"
                      {...register("password")}
                    />
                  </div>
                  <FieldError errors={[errors.password]} />
                </Field>
              </div>

              <div className="mt-4">
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                  <div className="relative">
                    <Lock className={iconProps} />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Répétez le mot de passe"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      className="pl-8"
                      {...register("confirmPassword")}
                    />
                  </div>
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              </div>

              <Field className="mt-4" orientation="horizontal" data-invalid={!!errors.acceptTerms}>
                <Checkbox
                  id="acceptTerms"
                  aria-invalid={!!errors.acceptTerms}
                  onCheckedChange={(checked) =>
                    setValue("acceptTerms", checked === true, { shouldValidate: true })
                  }
                />
                <FieldLabel htmlFor="acceptTerms" className="font-normal">
                  J&apos;accepte les{" "}
                  <Link href="/cgu" className="text-primary underline underline-offset-4">
                    conditions d&apos;utilisation
                  </Link>
                </FieldLabel>
                <FieldError errors={[errors.acceptTerms]} />
              </Field>

              <Button type="submit" disabled={isSubmitting} className="mt-4 w-full">
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-medium text-primary underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </FieldGroup>
        </CardContent>
      </Card>
    </motion.div>
  );
}
