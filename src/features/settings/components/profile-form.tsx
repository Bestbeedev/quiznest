"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateProfileAction } from "@/features/settings/actions";
import { profileSchema, type ProfileInput } from "@/lib/validators/settings";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { getInitials } from "@/lib/utils/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

const TIMEZONES = [
  "UTC", "Africa/Abidjan", "Africa/Dakar", "Africa/Lagos", "Africa/Casablanca",
  "Europe/Paris", "Europe/London", "America/New_York", "America/Los_Angeles",
];

export function ProfileForm({
  user,
}: {
  user: { firstName: string; lastName: string; phone: string | null; image: string | null; timezone: string; language: string };
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
  } = useForm<ProfileInput>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? "",
      image: user.image ?? "",
      timezone: user.timezone,
      language: (user.language as "fr" | "en") ?? "fr",
    },
  });

  const image = watch("image");
  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSaved(false);

    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await updateProfileAction(parsed.data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
    toast.success("Profil mis à jour.");
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
            <AlertDescription>Profil mis à jour.</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {image && <AvatarImage src={image} alt="Avatar" />}
            <AvatarFallback>{getInitials(`${firstName} ${lastName}`.trim() || "?")}</AvatarFallback>
          </Avatar>
          <Field className="flex-1" data-invalid={!!errors.image}>
            <FieldLabel htmlFor="image">Avatar (URL de l&apos;image)</FieldLabel>
            <Input id="image" placeholder="https://..." {...register("image")} />
            <FieldError errors={[errors.image]} />
          </Field>
        </div>

        <Field orientation="responsive">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
            <Input id="firstName" aria-invalid={!!errors.firstName} {...register("firstName")} />
            <FieldError errors={[errors.firstName]} />
          </Field>
          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="lastName">Nom</FieldLabel>
            <Input id="lastName" aria-invalid={!!errors.lastName} {...register("lastName")} />
            <FieldError errors={[errors.lastName]} />
          </Field>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Téléphone (optionnel)</FieldLabel>
          <Input id="phone" {...register("phone")} />
          <FieldError errors={[errors.phone]} />
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
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription>S&apos;applique à votre interface personnelle.</FieldDescription>
          </Field>
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </FieldGroup>
    </form>
  );
}
