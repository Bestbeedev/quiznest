"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createPlanAction, updatePlanAction } from "@/features/admin/plans-actions";
import { planSchema, type PlanInput } from "@/lib/validators/plan";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { ALL_FEATURES, FEATURE_LABELS } from "@/constants/features";
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
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import type { FeatureKey } from "@/generated/prisma/client";

export type PlanForEdit = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  interval: "MONTH" | "YEAR";
  quizLimit: number | null;
  participantLimit: number | null;
  questionLimit: number | null;
  storageLimitMb: number | null;
  badge: string | null;
  color: string | null;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  isPromoted: boolean;
  trialDays: number | null;
  availableFrom: Date | string | null;
  availableUntil: Date | string | null;
  features: string[] | unknown;
  planFeatures: { feature: FeatureKey; enabled: boolean; limit: number | null }[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function defaultValuesFor(plan?: PlanForEdit): PlanInput {
  const grantByFeature = new Map((plan?.planFeatures ?? []).map((f) => [f.feature, f]));

  return {
    name: plan?.name ?? "",
    slug: plan?.slug ?? "",
    description: plan?.description ?? "",
    price: plan?.price ?? null,
    currency: plan?.currency ?? "XOF",
    interval: plan?.interval ?? "MONTH",
    quizLimit: plan?.quizLimit ?? null,
    participantLimit: plan?.participantLimit ?? null,
    questionLimit: plan?.questionLimit ?? null,
    storageLimitMb: plan?.storageLimitMb ?? null,
    badge: plan?.badge ?? "",
    color: plan?.color ?? "",
    icon: plan?.icon ?? "",
    displayOrder: plan?.displayOrder ?? 0,
    isActive: plan?.isActive ?? true,
    isPromoted: plan?.isPromoted ?? false,
    trialDays: plan?.trialDays ?? null,
    availableFrom: plan?.availableFrom ? new Date(plan.availableFrom) : null,
    availableUntil: plan?.availableUntil ? new Date(plan.availableUntil) : null,
    marketingFeatures: Array.isArray(plan?.features) ? (plan.features as string[]) : [],
    features: ALL_FEATURES.map((feature) => ({
      feature,
      enabled: grantByFeature.get(feature)?.enabled ?? false,
      limit: grantByFeature.get(feature)?.limit ?? null,
    })),
  };
}

export function PlanFormDialog({ plan, trigger }: { plan?: PlanForEdit; trigger?: React.ReactElement }) {
  const router = useRouter();
  const isEdit = !!plan;
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanInput>({ defaultValues: defaultValuesFor(plan) });

  const marketingFeatures = watch("marketingFeatures");
  const features = watch("features");

  const close = () => {
    setOpen(false);
    reset(defaultValuesFor(plan));
    setServerError(null);
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = planSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = isEdit ? await updatePlanAction(plan.id, parsed.data) : await createPlanAction(parsed.data);

    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Plan mis à jour." : "Plan créé.");
    close();
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4" />
          Nouveau plan
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le plan" : "Créer un plan"}</DialogTitle>
          <DialogDescription>
            Ces changements s&apos;appliquent immédiatement à toute la plateforme (pricing, dashboard, feature gate).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            <Field orientation="responsive">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="plan-name">Nom</FieldLabel>
                <Input
                  id="plan-name"
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    onChange: (e) => {
                      if (!slugTouched) setValue("slug", slugify(e.target.value));
                    },
                  })}
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="plan-slug">Slug</FieldLabel>
                <Input
                  id="plan-slug"
                  aria-invalid={!!errors.slug}
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
                <FieldError errors={[errors.slug]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="plan-description">Description</FieldLabel>
              <Input id="plan-description" {...register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field orientation="responsive">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="plan-price">Prix (vide = sur devis)</FieldLabel>
                <Input id="plan-price" type="number" min={0} {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-currency">Devise</FieldLabel>
                <Input id="plan-currency" {...register("currency")} />
              </Field>
              <Field>
                <FieldLabel>Fréquence</FieldLabel>
                <Select value={watch("interval")} onValueChange={(v) => v && setValue("interval", v as PlanInput["interval"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTH">Mensuel</SelectItem>
                    <SelectItem value="YEAR">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Field>

            <Separator />
            <p className="text-sm font-medium">Quotas (vide = illimité)</p>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="plan-quiz-limit">Quiz</FieldLabel>
                <Input id="plan-quiz-limit" type="number" min={0} {...register("quizLimit")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-participant-limit">Participants</FieldLabel>
                <Input id="plan-participant-limit" type="number" min={0} {...register("participantLimit")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-question-limit">Questions / quiz</FieldLabel>
                <Input id="plan-question-limit" type="number" min={0} {...register("questionLimit")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-storage-limit">Stockage (Mo)</FieldLabel>
                <Input id="plan-storage-limit" type="number" min={0} {...register("storageLimitMb")} />
              </Field>
            </Field>

            <Separator />
            <p className="text-sm font-medium">Présentation</p>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="plan-badge">Badge (ex: Recommandé)</FieldLabel>
                <Input id="plan-badge" {...register("badge")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-color">Couleur (ex: violet)</FieldLabel>
                <Input id="plan-color" {...register("color")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-icon">Icône (nom lucide, ex: crown)</FieldLabel>
                <Input id="plan-icon" {...register("icon")} />
              </Field>
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="plan-order">Ordre d&apos;affichage</FieldLabel>
                <Input id="plan-order" type="number" min={0} {...register("displayOrder")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-trial">Essai gratuit (jours)</FieldLabel>
                <Input id="plan-trial" type="number" min={0} {...register("trialDays")} />
              </Field>
            </Field>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={watch("isActive")} onCheckedChange={(c) => setValue("isActive", c === true)} />
                Actif (visible publiquement)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={watch("isPromoted")} onCheckedChange={(c) => setValue("isPromoted", c === true)} />
                Mettre en avant
              </label>
            </div>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="plan-from">Disponible à partir du (optionnel)</FieldLabel>
                <Input
                  id="plan-from"
                  type="date"
                  defaultValue={toDateInputValue(plan?.availableFrom)}
                  onChange={(e) => setValue("availableFrom", e.target.value ? new Date(e.target.value) : null)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="plan-until">Disponible jusqu&apos;au (optionnel)</FieldLabel>
                <Input
                  id="plan-until"
                  type="date"
                  defaultValue={toDateInputValue(plan?.availableUntil)}
                  onChange={(e) => setValue("availableUntil", e.target.value ? new Date(e.target.value) : null)}
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="plan-marketing-features">Points forts affichés (séparés par des virgules)</FieldLabel>
              <Input
                id="plan-marketing-features"
                value={marketingFeatures.join(", ")}
                onChange={(e) =>
                  setValue(
                    "marketingFeatures",
                    e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  )
                }
                placeholder="Quiz illimités, Support prioritaire, ..."
              />
              <FieldDescription>Texte marketing affiché sur les cartes de prix (pas de logique d&apos;accès).</FieldDescription>
            </Field>

            <Separator />
            <p className="text-sm font-medium">Fonctionnalités incluses (Feature Gate)</p>
            <div className="flex flex-col divide-y rounded-lg border">
              {ALL_FEATURES.map((feature, index) => (
                <div key={feature} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={features[index]?.enabled}
                      onCheckedChange={(c) => setValue(`features.${index}.enabled`, c === true)}
                    />
                    <span className="truncate">{FEATURE_LABELS[feature]}</span>
                  </label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Illimité"
                    disabled={!features[index]?.enabled}
                    className="h-8 w-28"
                    value={features[index]?.limit ?? ""}
                    onChange={(e) =>
                      setValue(`features.${index}.limit`, e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </div>
              ))}
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
