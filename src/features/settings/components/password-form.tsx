"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { changePasswordAction } from "@/features/settings/actions";
import { passwordSchema, type PasswordInput } from "@/lib/validators/settings";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function PasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);

    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await changePasswordAction(parsed.data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    setSaved(true);
    reset();
    toast.success("Mot de passe modifié.");
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md">
      <FieldGroup>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {saved && (
          <Alert>
            <AlertDescription>Mot de passe mis à jour. Vos autres sessions ont été déconnectées.</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.currentPassword}>
          <FieldLabel htmlFor="currentPassword">Mot de passe actuel</FieldLabel>
          <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
          <FieldError errors={[errors.currentPassword]} />
        </Field>

        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="newPassword">Nouveau mot de passe</FieldLabel>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
          <FieldDescription>8 caractères minimum.</FieldDescription>
          <FieldError errors={[errors.newPassword]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe</FieldLabel>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-fit gap-1.5">
          <KeyRound className="size-4" />
          {isSubmitting ? "Mise à jour..." : "Changer le mot de passe"}
        </Button>
      </FieldGroup>
    </form>
  );
}
