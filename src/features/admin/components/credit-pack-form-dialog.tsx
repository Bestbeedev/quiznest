"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createCreditPackAction, updateCreditPackAction } from "@/features/admin/commerce-actions";
import { creditPackSchema, type CreditPackInput } from "@/lib/validators/credit-pack";
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

export type CreditPackForEdit = CreditPackInput & { id: string };

export function CreditPackFormDialog({ pack }: { pack?: CreditPackForEdit }) {
  const router = useRouter();
  const isEdit = !!pack;
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: CreditPackInput = pack ?? {
    name: "",
    price: 1000,
    currency: "XOF",
    credits: 1000,
    isActive: true,
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
  } = useForm<CreditPackInput>({ defaultValues });

  const close = () => {
    setOpen(false);
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const parsed = creditPackSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = isEdit
      ? await updateCreditPackAction(pack.id, parsed.data)
      : await createCreditPackAction(parsed.data);
    if ("error" in result) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Pack mis à jour." : "Pack créé.");
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
          Nouveau pack
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le pack" : "Créer un pack de crédits"}</DialogTitle>
          <DialogDescription>Bundle de crédits Wallet achetable par les organisations.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="pack-name">Nom</FieldLabel>
              <Input id="pack-name" aria-invalid={!!errors.name} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field orientation="responsive">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="pack-price">Prix</FieldLabel>
                <Input id="pack-price" type="number" min={1} aria-invalid={!!errors.price} {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="pack-currency">Devise</FieldLabel>
                <Input id="pack-currency" {...register("currency")} />
              </Field>
              <Field data-invalid={!!errors.credits}>
                <FieldLabel htmlFor="pack-credits">Crédits</FieldLabel>
                <Input id="pack-credits" type="number" min={1} aria-invalid={!!errors.credits} {...register("credits")} />
                <FieldError errors={[errors.credits]} />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="pack-order">Ordre d&apos;affichage</FieldLabel>
              <Input id="pack-order" type="number" min={0} {...register("displayOrder")} />
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c === true)} />
              Actif
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le pack"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
