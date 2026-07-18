"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { startAttemptAction } from "@/features/participation/actions";
import { startAttemptSchema, type StartAttemptInput } from "@/lib/validators/participation";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function StartAttemptForm({ accessCode }: { accessCode: string }) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StartAttemptInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = startAttemptSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await startAttemptAction(accessCode, parsed.data);
    if (result?.error) {
      setServerError(result.error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Nom</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email (optionnel)</FieldLabel>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError errors={[errors.email]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Démarrage..." : "Commencer le quiz"}
        </Button>
      </FieldGroup>
    </form>
  );
}
