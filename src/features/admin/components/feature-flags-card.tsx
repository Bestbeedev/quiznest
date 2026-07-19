"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updatePlatformSettingsAction } from "@/features/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { UpdatePlatformSettingsInput } from "@/lib/validators/platform-settings";

type FlagKey = "aiGeneration" | "exportsEnabled" | "allowSignups" | "billingEnabled";

const FLAGS: { key: FlagKey; name: string; description: string }[] = [
  { key: "aiGeneration", name: "Génération IA", description: "Permettre la génération de questions par IA" },
  { key: "exportsEnabled", name: "Exports CSV/Excel", description: "Permettre l'export des données en CSV et Excel" },
  { key: "allowSignups", name: "Nouvelles inscriptions", description: "Permettre la création de nouveaux comptes" },
  { key: "billingEnabled", name: "Facturation", description: "Activer le module de paiement" },
];

export function FeatureFlagsCard({ settings }: { settings: Record<FlagKey, boolean> }) {
  const [isPending, startTransition] = useTransition();

  const toggle = (key: FlagKey, value: boolean) => {
    startTransition(async () => {
      const result = await updatePlatformSettingsAction({ [key]: value } satisfies UpdatePlatformSettingsInput);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(value ? "Fonctionnalité activée." : "Fonctionnalité désactivée.");
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col divide-y">
        {FLAGS.map((flag) => (
          <label
            key={flag.key}
            className="flex cursor-pointer items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{flag.name}</p>
              <p className="text-xs text-muted-foreground">{flag.description}</p>
            </div>
            <Checkbox
              checked={settings[flag.key]}
              disabled={isPending}
              onCheckedChange={(checked) => toggle(flag.key, checked === true)}
            />
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
