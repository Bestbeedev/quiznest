"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { updateNotificationPreferencesAction } from "@/features/settings/actions";
import type { NotificationPreferencesInput } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";

const OPTIONS: { key: keyof NotificationPreferencesInput; label: string; description: string }[] = [
  { key: "quizResults", label: "Résultats de quiz", description: "Un résumé quand un participant termine un quiz." },
  { key: "weeklyDigest", label: "Résumé hebdomadaire", description: "Statistiques de la semaine pour votre organisation." },
  { key: "teamActivity", label: "Activité de l'équipe", description: "Nouveaux membres, changements de rôle." },
];

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreferencesInput }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { watch, setValue, handleSubmit, formState: { isSubmitting } } = useForm<NotificationPreferencesInput>({
    defaultValues: preferences,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    await updateNotificationPreferencesAction(values);
    setSaved(true);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <FieldGroup>
        <Alert>
          <AlertDescription>
            L&apos;envoi d&apos;emails n&apos;est pas encore activé sur cette plateforme — ces préférences
            seront appliquées dès qu&apos;il le sera.
          </AlertDescription>
        </Alert>
        {saved && (
          <Alert>
            <AlertDescription>Préférences enregistrées.</AlertDescription>
          </Alert>
        )}

        {OPTIONS.map((option) => (
          <Field key={option.key} orientation="horizontal">
            <Checkbox
              id={option.key}
              checked={watch(option.key)}
              onCheckedChange={(checked) => setValue(option.key, checked === true)}
            />
            <div>
              <FieldLabel htmlFor={option.key} className="font-normal">
                {option.label}
              </FieldLabel>
              <FieldDescription>{option.description}</FieldDescription>
            </div>
          </Field>
        ))}

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </FieldGroup>
    </form>
  );
}
