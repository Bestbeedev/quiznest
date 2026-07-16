"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { addQuestionAction } from "@/features/quiz/actions";
import { createQuestionSchema, type CreateQuestionInput } from "@/lib/validators/question";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

const TYPE_LABELS = {
  SINGLE_CHOICE: "QCM (choix unique)",
  MULTIPLE_CHOICE: "Choix multiple",
  TRUE_FALSE: "Vrai / Faux",
} as const;

const DEFAULT_VALUES: CreateQuestionInput = {
  title: "",
  type: "SINGLE_CHOICE",
  points: 1,
  explanation: "",
  choices: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
};

export function AddQuestionDialog({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuestionInput>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove } = useFieldArray({ control, name: "choices" });
  const type = watch("type");
  const choices = watch("choices");
  const singleAnswer = type === "SINGLE_CHOICE" || type === "TRUE_FALSE";

  const handleTypeChange = (value: CreateQuestionInput["type"] | null) => {
    if (!value) return;
    setValue("type", value);
    if (value === "TRUE_FALSE") {
      setValue("choices", [
        { text: "Vrai", isCorrect: false },
        { text: "Faux", isCorrect: false },
      ]);
    }
  };

  const toggleCorrect = (index: number) => {
    if (singleAnswer) {
      setValue(
        "choices",
        choices.map((choice, i) => ({ ...choice, isCorrect: i === index })),
      );
    } else {
      setValue(`choices.${index}.isCorrect`, !choices[index].isCorrect);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = createQuestionSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await addQuestionAction(quizId, parsed.data);
    if (result?.error) {
      setServerError(result.error);
      return;
    }

    setOpen(false);
    reset(DEFAULT_VALUES);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset(DEFAULT_VALUES);
      }}
    >
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted">
        <Plus className="size-4" />
        Ajouter une question
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une question</DialogTitle>
          <DialogDescription>Choisissez un type puis renseignez la question et ses choix.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field>
              <FieldLabel>Type de question</FieldLabel>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="question-title">Question</FieldLabel>
              <Input id="question-title" aria-invalid={!!errors.title} {...register("title")} />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field data-invalid={!!errors.choices}>
              <FieldLabel>Choix de réponse</FieldLabel>
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={choices[index]?.isCorrect}
                      onCheckedChange={() => toggleCorrect(index)}
                      aria-label="Bonne réponse"
                    />
                    <Input
                      readOnly={type === "TRUE_FALSE"}
                      {...register(`choices.${index}.text`)}
                      placeholder={`Choix ${index + 1}`}
                    />
                    {type !== "TRUE_FALSE" && fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <FieldError errors={[errors.choices]} />
              {type !== "TRUE_FALSE" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => append({ text: "", isCorrect: false })}
                >
                  <Plus className="size-4" />
                  Ajouter un choix
                </Button>
              )}
            </Field>

            <Field data-invalid={!!errors.points}>
              <FieldLabel htmlFor="points">Points</FieldLabel>
              <Input id="points" type="number" min={1} aria-invalid={!!errors.points} {...register("points")} />
              <FieldError errors={[errors.points]} />
            </Field>

            <Field data-invalid={!!errors.explanation}>
              <FieldLabel htmlFor="explanation">Explication (optionnel)</FieldLabel>
              <Input id="explanation" aria-invalid={!!errors.explanation} {...register("explanation")} />
              <FieldError errors={[errors.explanation]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ajout..." : "Ajouter la question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
