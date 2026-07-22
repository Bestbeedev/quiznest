"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateOrganizationAction } from "@/features/settings/actions";
import { updateOrganizationSchema, type UpdateOrganizationInput } from "@/lib/validators/settings";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Lock, ArrowUpRight } from "lucide-react";
import type { FeatureCheckUI } from "@/components/shared/feature-lock";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TIMEZONES = [
  "UTC", "Africa/Abidjan", "Africa/Dakar", "Africa/Lagos", "Africa/Casablanca",
  "Europe/Paris", "Europe/London", "America/New_York", "America/Los_Angeles",
];

export function OrganizationSettingsForm({
  organization,
  brandingCheck,
}: {
  organization: {
    name: string;
    slug: string;
    logo: string | null;
    timezone: string;
    language: string;
    primaryColor: string | null;
  };
  brandingCheck?: FeatureCheckUI;
}) {
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
  } = useForm<UpdateOrganizationInput>({
    defaultValues: {
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo ?? "",
      timezone: organization.timezone,
      language: (organization.language as "fr" | "en") ?? "fr",
      primaryColor: organization.primaryColor ?? "#2857e5",
    },
  });

  const logo = watch("logo");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);

    const parsed = updateOrganizationSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await updateOrganizationAction(parsed.data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
    toast.success("Organisation mise à jour.");
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
            <AlertDescription>Organisation mise à jour.</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {logo && <AvatarImage src={logo} alt="Logo" />}
            <AvatarFallback>{organization.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Field className="flex-1" data-invalid={!!errors.logo}>
            <FieldLabel htmlFor="logo">Logo (URL de l&apos;image)</FieldLabel>
            <Input id="logo" placeholder="https://..." {...register("logo")} />
            <FieldError errors={[errors.logo]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="org-name">Nom</FieldLabel>
          <Input id="org-name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="org-slug">Identifiant</FieldLabel>
          <Input id="org-slug" aria-invalid={!!errors.slug} {...register("slug")} />
          <FieldDescription>Lettres minuscules, chiffres et tirets uniquement.</FieldDescription>
          <FieldError errors={[errors.slug]} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel>Fuseau horaire</FieldLabel>
            <Select value={watch("timezone")} onValueChange={(v) => v && setValue("timezone", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Langue</FieldLabel>
            <Select
              value={watch("language")}
              onValueChange={(v) => v && setValue("language", v as "fr" | "en")}
              items={{ fr: "Français", en: "English" }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Field>

        <Field data-invalid={!!errors.primaryColor}>
          <FieldLabel htmlFor="primaryColor">Couleur principale (branding)</FieldLabel>
          {brandingCheck && !brandingCheck.allowed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-md border border-dashed p-2 opacity-60">
                <input
                  type="color"
                  value={organization.primaryColor || "#2857e5"}
                  disabled
                  className="size-8 shrink-0 cursor-not-allowed rounded-md border"
                  aria-label="Couleur principale"
                />
                <Input value={organization.primaryColor ?? "#2857e5"} disabled className="max-w-32" />
              </div>
              <p className="text-xs text-muted-foreground">{brandingCheck.reason ?? "Personnalisation de marque non incluse dans votre plan."}</p>
              <Link href="/dashboard/billing" className={cn("inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline")}>
                <ArrowUpRight className="size-3" />
                Débloquer avec un plan payant
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={watch("primaryColor") || "#2857e5"}
                onChange={(e) => setValue("primaryColor", e.target.value)}
                className="size-8 shrink-0 cursor-pointer rounded-md border"
                aria-label="Couleur principale"
              />
              <Input className="max-w-32" {...register("primaryColor")} />
            </div>
          )}
          <FieldDescription>
            Enregistrée pour votre profil de marque — pas encore appliquée à l&apos;interface.
          </FieldDescription>
          <FieldError errors={[errors.primaryColor]} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </FieldGroup>
    </form>
  );
}
