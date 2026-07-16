"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";

import { createQuizAction } from "@/features/quiz/actions";
import { createQuizSchema, type CreateQuizInput } from "@/lib/validators/quiz";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export function NewQuizDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuizInput>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = createQuizSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await createQuizAction(parsed.data);
    if (result?.error) {
      setServerError(result.error);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80">
        <Plus className="size-4" />
        Nouveau quiz
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau quiz</DialogTitle>
          <DialogDescription>
            Donnez un titre à votre quiz — vous pourrez ajouter les questions et régler les
            paramètres juste après.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="title">Titre</FieldLabel>
            <Input id="title" autoFocus aria-invalid={!!errors.title} {...register("title")} />
            <FieldError errors={[errors.title]} />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Création..." : "Créer le quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
