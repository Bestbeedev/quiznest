"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createPassAction, updatePassAction } from "@/features/admin/commerce-actions";
import { passSchema, type PassInput } from "@/lib/validators/pass";
import { ALL_FEATURES, FEATURE_LABELS } from "@/constants/features";
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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export type PassForEdit = Omit<PassInput, "description"> & { id: string; description: string | null };

export function PassFormDialog({ pass }: { pass?: PassForEdit }) {
  const router = useRouter();
  const isEdit = !!pass;
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: PassInput = pass
    ? { ...pass, description: pass.description ?? "" }
    : {
        name: "",
        description: "",
        price: 3000,
        currency: "XOF",
        durationDays: 30,
        features: [],
        isActive: true,
        isPromoted: false,
        displayOrder: 0,
      };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PassInput>({ defaultValues });

  const features = watch("features");

  const close = () => {
    setOpen(false);
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const parsed = passSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = isEdit ? await updatePassAction(pass.id, parsed.data) : await createPassAction(parsed.data);
    if ("error" in result) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Pass mis à jour." : "Pass créé.");
    close();
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      {isEdit ? (
        <DialogTrigger className="text-sm font-medium text-primary hover:underline">Modifier</DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" />
          Nouveau pass
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le pass" : "Créer un pass"}</DialogTitle>
          <DialogDescription>Bundle de fonctionnalités accessible pendant une durée limitée.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="pass-name">Nom</FieldLabel>
              <Input id="pass-name" placeholder="ex: Pass IA" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="pass-description">Description</FieldLabel>
              <Input id="pass-description" {...register("description")} />
            </Field>

            <Field orientation="responsive">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="pass-price">Prix</FieldLabel>
                <Input id="pass-price" type="number" min={1} aria-invalid={!!errors.price} {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="pass-currency">Devise</FieldLabel>
                <Input id="pass-currency" {...register("currency")} />
              </Field>
              <Field data-invalid={!!errors.durationDays}>
                <FieldLabel htmlFor="pass-duration">Durée (jours)</FieldLabel>
                <Input id="pass-duration" type="number" min={1} aria-invalid={!!errors.durationDays} {...register("durationDays")} />
                <FieldError errors={[errors.durationDays]} />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="pass-order">Ordre d&apos;affichage</FieldLabel>
              <Input id="pass-order" type="number" min={0} {...register("displayOrder")} />
            </Field>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c === true)} />
                Actif
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={watch("isPromoted")} onCheckedChange={(c) => setValue("isPromoted", c === true)} />
                Mettre en avant
              </label>
            </div>

            <Field>
              <FieldLabel>Fonctionnalités incluses</FieldLabel>
              <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {ALL_FEATURES.map((feature) => (
                  <label key={feature} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={features.includes(feature)}
                      onCheckedChange={(c) =>
                        setValue("features", c ? [...features, feature] : features.filter((f) => f !== feature))
                      }
                    />
                    {FEATURE_LABELS[feature]}
                  </label>
                ))}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le pass"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
