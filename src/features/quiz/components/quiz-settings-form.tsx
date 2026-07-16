"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { updateQuizSettingsAction } from "@/features/quiz/actions";
import {
  updateQuizSettingsSchema,
  type UpdateQuizSettingsInput,
} from "@/lib/validators/quiz";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import type { Quiz } from "@/generated/prisma/client";

export function QuizSettingsForm({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateQuizSettingsInput>({
    defaultValues: {
      title: quiz.title,
      description: quiz.description ?? "",
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      attempts: quiz.attempts,
      randomOrder: quiz.randomOrder,
      shuffleChoices: quiz.shuffleChoices,
      fullscreen: quiz.fullscreen,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);

    const parsed = updateQuizSettingsSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await updateQuizSettingsAction(quiz.id, parsed.data);
    if (result?.error) {
      setServerError(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <FieldGroup>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        {saved && (
          <Alert>
            <AlertDescription>Paramètres enregistrés.</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Titre</FieldLabel>
          <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Input id="description" aria-invalid={!!errors.description} {...register("description")} />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field orientation="responsive">
          <Field data-invalid={!!errors.timeLimit}>
            <FieldLabel htmlFor="timeLimit">Durée (minutes)</FieldLabel>
            <Input
              id="timeLimit"
              type="number"
              min={1}
              aria-invalid={!!errors.timeLimit}
              {...register("timeLimit")}
            />
            <FieldDescription>Laisser vide pour aucune limite.</FieldDescription>
            <FieldError errors={[errors.timeLimit]} />
          </Field>

          <Field data-invalid={!!errors.attempts}>
            <FieldLabel htmlFor="attempts">Tentatives autorisées</FieldLabel>
            <Input
              id="attempts"
              type="number"
              min={1}
              aria-invalid={!!errors.attempts}
              {...register("attempts")}
            />
            <FieldError errors={[errors.attempts]} />
          </Field>
        </Field>

        <Field data-invalid={!!errors.passingScore}>
          <FieldLabel htmlFor="passingScore">Score minimum pour réussir (%)</FieldLabel>
          <Input
            id="passingScore"
            type="number"
            min={0}
            max={100}
            aria-invalid={!!errors.passingScore}
            {...register("passingScore")}
          />
          <FieldError errors={[errors.passingScore]} />
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="randomOrder"
            checked={watch("randomOrder")}
            onCheckedChange={(checked) => setValue("randomOrder", checked === true)}
          />
          <FieldLabel htmlFor="randomOrder" className="font-normal">
            Ordre aléatoire des questions
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="shuffleChoices"
            checked={watch("shuffleChoices")}
            onCheckedChange={(checked) => setValue("shuffleChoices", checked === true)}
          />
          <FieldLabel htmlFor="shuffleChoices" className="font-normal">
            Mélanger les réponses
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="fullscreen"
            checked={watch("fullscreen")}
            onCheckedChange={(checked) => setValue("fullscreen", checked === true)}
          />
          <FieldLabel htmlFor="fullscreen" className="font-normal">
            Mode plein écran
          </FieldLabel>
        </Field>

        <Field>
          <FieldLabel>Code d&apos;accès</FieldLabel>
          <Input value={quiz.accessCode ?? ""} readOnly disabled />
          <FieldDescription>Généré automatiquement, partagez-le à vos participants.</FieldDescription>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </FieldGroup>
    </form>
  );
}
