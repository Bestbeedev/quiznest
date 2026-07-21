"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createAddOnProductAction, updateAddOnProductAction } from "@/features/admin/commerce-actions";
import { addOnProductSchema, type AddOnProductInput } from "@/lib/validators/addon-product";
import { ADDON_EFFECT_LABELS } from "@/constants/addon-effects";
import { FEATURE_LABELS } from "@/constants/features";
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
import type { AddOnEffect, FeatureKey } from "@/generated/prisma/client";

export type AddOnProductForEdit = Omit<AddOnProductInput, "description"> & {
  id: string;
  description: string | null;
};

export function AddOnFormDialog({ product }: { product?: AddOnProductForEdit }) {
  const router = useRouter();
  const isEdit = !!product;
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: AddOnProductInput = product
    ? { ...product, description: product.description ?? "" }
    : {
        name: "",
        description: "",
        price: 2000,
        currency: "XOF",
        effect: "EXTRA_PARTICIPANTS",
        amount: 100,
        targetFeature: null,
        isOneTime: false,
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
  } = useForm<AddOnProductInput>({ defaultValues });

  const effect = watch("effect");
  const isOneTime = watch("isOneTime");
  const targetFeature = watch("targetFeature");

  const close = () => {
    setOpen(false);
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const parsed = addOnProductSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = isEdit
      ? await updateAddOnProductAction(product.id, parsed.data)
      : await createAddOnProductAction(parsed.data);
    if ("error" in result) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Module mis à jour." : "Module créé.");
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
          Nouveau module
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le module" : "Créer un module Pay-as-you-go"}</DialogTitle>
          <DialogDescription>Achat ponctuel qui étend un plan sans le remplacer.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="addon-name">Nom</FieldLabel>
              <Input id="addon-name" placeholder="ex: +100 participants" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="addon-description">Description</FieldLabel>
              <Input id="addon-description" {...register("description")} />
            </Field>

            <Field>
              <FieldLabel>Effet</FieldLabel>
              <Select value={effect} onValueChange={(v) => v && setValue("effect", v as AddOnProductInput["effect"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADDON_EFFECT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Feature cible</FieldLabel>
              <Select
                value={targetFeature ?? "__none__"}
                onValueChange={(v) => setValue("targetFeature", v === "__none__" ? null : (v as FeatureKey))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aucune (pas de mapping feature)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune</SelectItem>
                  {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Lie ce module à une feature du plan. Quand défini, acheter ce module étend la quota de cette feature.
              </p>
            </Field>

            <Field orientation="responsive">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="addon-price">Prix</FieldLabel>
                <Input id="addon-price" type="number" min={1} aria-invalid={!!errors.price} {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="addon-currency">Devise</FieldLabel>
                <Input id="addon-currency" {...register("currency")} />
              </Field>
              {!isOneTime && (
                <Field data-invalid={!!errors.amount}>
                  <FieldLabel htmlFor="addon-amount">Quantité</FieldLabel>
                  <Input id="addon-amount" type="number" min={1} aria-invalid={!!errors.amount} {...register("amount")} />
                  <FieldError errors={[errors.amount]} />
                </Field>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="addon-order">Ordre d&apos;affichage</FieldLabel>
              <Input id="addon-order" type="number" min={0} {...register("displayOrder")} />
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
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={isOneTime} onCheckedChange={(c) => setValue("isOneTime", c === true)} />
                Déverrouillage unique
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground">
              « Déverrouillage unique » = achat ponctuel qui donne un accès permanent. Sinon, c&apos;est un module consommable (quantité décrémentée à l&apos;utilisation).
            </p>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
