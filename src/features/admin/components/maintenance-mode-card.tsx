"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updatePlatformSettingsAction } from "@/features/admin/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

export function MaintenanceModeCard({
  maintenanceMode,
  maintenanceMessage,
}: {
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
}) {
  const [enabled, setEnabled] = useState(maintenanceMode);
  const [message, setMessage] = useState(maintenanceMessage ?? "");
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updatePlatformSettingsAction({
        maintenanceMode: enabled,
        maintenanceMessage: message,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(enabled ? "Mode maintenance activé." : "Mode maintenance désactivé.");
    });
  };

  return (
    <Card className={enabled ? "border-destructive/40" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Mode maintenance</CardTitle>
          <Badge variant={enabled ? "destructive" : "outline"}>{enabled ? "Activé" : "Désactivé"}</Badge>
        </div>
        <CardDescription>
          Bloque l&apos;accès au site public et au dashboard pour tous les utilisateurs non
          super-admin. Les super-admins gardent l&apos;accès à /admin pour le désactiver.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={enabled} onCheckedChange={(c) => setEnabled(c === true)} />
          Activer le mode maintenance
        </label>

        <Field>
          <FieldLabel htmlFor="maintenance-message">Message affiché aux utilisateurs</FieldLabel>
          <textarea
            id="maintenance-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="QuizNest est actuellement en maintenance. Nous serons de retour très bientôt."
            className="w-full rounded-lg border bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <FieldDescription>Laissez vide pour utiliser le message par défaut.</FieldDescription>
        </Field>

        <Button type="button" onClick={save} disabled={isPending} className="w-fit">
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
