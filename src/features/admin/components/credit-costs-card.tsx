"use client";

import { useState } from "react";
import { useTransition } from "react";
import { toast } from "sonner";

import { updatePlatformSettingsAction } from "@/features/admin/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CREDIT_COST_LABELS, type CreditCostKey } from "@/constants/credit-costs";

type Props = {
  creditCostAiGeneration: number | null;
  creditCostExport: number | null;
  creditCostCertificate: number | null;
};

const FIELDS: { key: CreditCostKey; field: "creditCostAiGeneration" | "creditCostExport" | "creditCostCertificate"; label: string }[] = [
  { key: "AI_GENERATION", field: "creditCostAiGeneration", label: CREDIT_COST_LABELS.AI_GENERATION.label },
  { key: "EXPORT", field: "creditCostExport", label: CREDIT_COST_LABELS.EXPORT.label },
  { key: "CERTIFICATE", field: "creditCostCertificate", label: CREDIT_COST_LABELS.CERTIFICATE.label },
];

const DEFAULTS: Record<CreditCostKey, number> = {
  AI_GENERATION: 2,
  EXPORT: 1,
  CERTIFICATE: 3,
};

export function CreditCostsCard({ creditCostAiGeneration, creditCostExport, creditCostCertificate }: Props) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<CreditCostKey, string>>({
    AI_GENERATION: String(creditCostAiGeneration ?? DEFAULTS.AI_GENERATION),
    EXPORT: String(creditCostExport ?? DEFAULTS.EXPORT),
    CERTIFICATE: String(creditCostCertificate ?? DEFAULTS.CERTIFICATE),
  });
  const [dirty, setDirty] = useState(false);

  const update = (key: CreditCostKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = () => {
    startTransition(async () => {
      const result = await updatePlatformSettingsAction({
        creditCostAiGeneration: parseInt(values.AI_GENERATION, 10) || null,
        creditCostExport: parseInt(values.EXPORT, 10) || null,
        creditCostCertificate: parseInt(values.CERTIFICATE, 10) || null,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Coûts en crédits mis à jour.");
      setDirty(false);
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Coûts débités du wallet quand le quota plan est épuisé. Valeur à 0 = action gratuite.
        </p>
        <div className="flex flex-col gap-2">
          {FIELDS.map(({ key, field, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="flex-1 text-sm font-medium">{label}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  className="w-20 text-right"
                  value={values[key]}
                  onChange={(e) => update(key, e.target.value)}
                  disabled={isPending}
                />
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {CREDIT_COST_LABELS[key].per}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button size="sm" disabled={isPending || !dirty} onClick={save}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
