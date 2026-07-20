"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createCouponAction, updateCouponAction } from "@/features/admin/commerce-actions";
import { couponSchema, type CouponInput } from "@/lib/validators/coupon";
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

export type CouponForEdit = Omit<CouponInput, "currency"> & { id: string; currency: string | null };

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function CouponFormDialog({ coupon, plans }: { coupon?: CouponForEdit; plans: { id: string; name: string }[] }) {
  const router = useRouter();
  const isEdit = !!coupon;
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: CouponInput = coupon
    ? { ...coupon, currency: coupon.currency ?? "" }
    : {
        code: "",
        type: "PERCENTAGE",
        value: 10,
        currency: "",
        startsAt: null,
        endsAt: null,
        maxRedemptions: null,
        isActive: true,
        planIds: [],
      };

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponInput>({ defaultValues });

  const type = watch("type");
  const planIds = watch("planIds");

  const close = () => {
    setOpen(false);
    reset(defaultValues);
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const parsed = couponSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = isEdit ? await updateCouponAction(coupon.id, parsed.data) : await createCouponAction(parsed.data);
    if ("error" in result) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Coupon mis à jour." : "Coupon créé.");
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
          Nouveau coupon
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le coupon" : "Créer un coupon"}</DialogTitle>
          <DialogDescription>Code promo appliqué au moment du paiement d&apos;un abonnement.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field data-invalid={!!errors.code}>
              <FieldLabel htmlFor="coupon-code">Code</FieldLabel>
              <Input
                id="coupon-code"
                placeholder="PROMO2026"
                aria-invalid={!!errors.code}
                {...register("code", { onChange: (e) => setValue("code", e.target.value.toUpperCase()) })}
              />
              <FieldError errors={[errors.code]} />
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel>Type</FieldLabel>
                <Select value={type} onValueChange={(v) => v && setValue("type", v as CouponInput["type"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                    <SelectItem value="FIXED">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field data-invalid={!!errors.value}>
                <FieldLabel htmlFor="coupon-value">{type === "PERCENTAGE" ? "Réduction (%)" : "Réduction (montant)"}</FieldLabel>
                <Input id="coupon-value" type="number" min={1} aria-invalid={!!errors.value} {...register("value")} />
                <FieldError errors={[errors.value]} />
              </Field>
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="coupon-starts">Début (optionnel)</FieldLabel>
                <Input
                  id="coupon-starts"
                  type="date"
                  defaultValue={toDateInputValue(coupon?.startsAt)}
                  onChange={(e) => setValue("startsAt", e.target.value ? new Date(e.target.value) : null)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="coupon-ends">Fin (optionnel)</FieldLabel>
                <Input
                  id="coupon-ends"
                  type="date"
                  defaultValue={toDateInputValue(coupon?.endsAt)}
                  onChange={(e) => setValue("endsAt", e.target.value ? new Date(e.target.value) : null)}
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="coupon-max">Utilisations max (vide = illimité)</FieldLabel>
              <Input id="coupon-max" type="number" min={1} {...register("maxRedemptions")} />
            </Field>

            <Field>
              <FieldLabel>Plans concernés (aucun = tous les plans)</FieldLabel>
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                {plans.map((plan) => (
                  <label key={plan.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={planIds.includes(plan.id)}
                      onCheckedChange={(c) =>
                        setValue("planIds", c ? [...planIds, plan.id] : planIds.filter((id) => id !== plan.id))
                      }
                    />
                    {plan.name}
                  </label>
                ))}
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c === true)} />
              Actif
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
