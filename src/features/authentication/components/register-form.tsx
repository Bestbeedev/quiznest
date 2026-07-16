"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import { signUp } from "@/lib/auth/client";
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

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

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
      setServerError(error.message ?? "Impossible de créer le compte.");
      return;
    }

    router.push("/dashboard");
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
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Commencez gratuitement avec QuizNest.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Field orientation="responsive">
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    {...register("firstName")}
                  />
                  <FieldError errors={[errors.firstName]} />
                </Field>
                <Field data-invalid={!!errors.lastName}>
                  <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                    {...register("lastName")}
                  />
                  <FieldError errors={[errors.lastName]} />
                </Field>
              </Field>

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
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>

              <Field orientation="horizontal" data-invalid={!!errors.acceptTerms}>
                <Checkbox
                  id="acceptTerms"
                  aria-invalid={!!errors.acceptTerms}
                  onCheckedChange={(checked) =>
                    setValue("acceptTerms", checked === true, { shouldValidate: true })
                  }
                />
                <FieldLabel htmlFor="acceptTerms" className="font-normal">
                  J&apos;accepte les conditions d&apos;utilisation
                </FieldLabel>
                <FieldError errors={[errors.acceptTerms]} />
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Création..." : "Créer mon compte"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link href="/login" className="text-primary underline underline-offset-4">
                  Se connecter
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
