"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updatePlatformSettingsAction } from "@/features/admin/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

export function NotificationSettingsCard({
  notificationEmail,
  notifyOnNewOrganization,
  notifyOnNewSubscription,
}: {
  notificationEmail: string | null;
  notifyOnNewOrganization: boolean;
  notifyOnNewSubscription: boolean;
}) {
  const [email, setEmail] = useState(notificationEmail ?? "");
  const [onNewOrg, setOnNewOrg] = useState(notifyOnNewOrganization);
  const [onNewSub, setOnNewSub] = useState(notifyOnNewSubscription);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updatePlatformSettingsAction({
        notificationEmail: email,
        notifyOnNewOrganization: onNewOrg,
        notifyOnNewSubscription: onNewSub,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Préférences de notification enregistrées.");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications administrateur</CardTitle>
        <CardDescription>
          Recevez un email lors d&apos;événements clés de la plateforme. Nécessite RESEND_API_KEY
          configurée côté serveur — sans clé, les envois sont simplement loggués.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="notification-email">Email de notification</FieldLabel>
          <Input
            id="notification-email"
            type="email"
            placeholder="admin@quiznest.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FieldDescription>Adresse qui recevra les alertes ci-dessous.</FieldDescription>
        </Field>

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox checked={onNewOrg} onCheckedChange={(c) => setOnNewOrg(c === true)} />
            Nouvelle organisation créée
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox checked={onNewSub} onCheckedChange={(c) => setOnNewSub(c === true)} />
            Nouvel abonnement souscrit
            <span className="text-xs text-muted-foreground">(sera actif avec les paiements)</span>
          </label>
        </div>

        <Button type="button" onClick={save} disabled={isPending} className="w-fit">
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
