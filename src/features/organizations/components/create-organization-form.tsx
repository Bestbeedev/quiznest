"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { createOrganizationAction } from "@/features/organizations/actions";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/lib/validators/organization";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { slugify } from "@/lib/utils/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function CreateOrganizationForm({ callbackUrl }: { callbackUrl?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationInput>({ defaultValues: { name: "", slug: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = createOrganizationSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await createOrganizationAction(parsed.data, callbackUrl ?? undefined);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader>
          <CardTitle>Créer votre organisation</CardTitle>
          <CardDescription>
            C&apos;est l&apos;espace où vous créerez et gérerez vos évaluations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Nom de l&apos;organisation</FieldLabel>
                <Input
                  id="name"
                  autoComplete="organization"
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    onChange: (e) => {
                      if (!slugEdited) {
                        setValue("slug", slugify(e.target.value));
                      }
                    },
                  })}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.slug}>
                <FieldLabel htmlFor="slug">Identifiant</FieldLabel>
                <Input
                  id="slug"
                  aria-invalid={!!errors.slug}
                  {...register("slug", {
                    onChange: () => setSlugEdited(true),
                  })}
                />
                <FieldDescription>{watch("slug") || "votre-organisation"}.quiznest.app</FieldDescription>
                <FieldError errors={[errors.slug]} />
              </Field>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Création..." : "Créer l'organisation"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
