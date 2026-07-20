"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createApiKeyAction, revokeApiKeyAction } from "@/features/settings/actions";
import { createApiKeySchema, type CreateApiKeyInput } from "@/lib/validators/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Field, FieldError } from "@/components/ui/field";
import type { FeatureCheckUI } from "@/components/shared/feature-lock";
import { Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  revokedAt: Date | string | null;
  createdAt: Date | string;
  creator: { name: string };
};

export function ApiKeysManager({ apiKeys, apiKeyCheck }: { apiKeys: ApiKeyRow[]; apiKeyCheck?: FeatureCheckUI }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateApiKeyInput>();

  const isGated = apiKeyCheck && !apiKeyCheck.allowed;

  const onSubmit = handleSubmit(async (values) => {
    const parsed = createApiKeySchema.safeParse(values);
    if (!parsed.success) return;

    const result = await createApiKeyAction(parsed.data);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    if (result?.key) {
      setNewKey(result.key);
      reset();
      router.refresh();
      toast.success("Clé API créée.");
    }
  });

  const copyKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeKeys = apiKeys.filter((k) => !k.revokedAt);

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <AlertDescription>
          Aucune API publique n&apos;est encore disponible sur QuizNest — ces clés sont créées et
          gérées ici en avance, mais aucun endpoint ne les vérifie pour le moment.
        </AlertDescription>
      </Alert>

      {isGated ? (
        <div className="flex flex-col gap-2 rounded-md border border-dashed p-4">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">Accès API non disponible</p>
          </div>
          <p className="text-xs text-muted-foreground">{apiKeyCheck?.reason ?? "L'accès API n'est pas inclus dans votre plan actuel."}</p>
          <Link href="/dashboard/billing" className={cn("inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline")}>
            <ArrowUpRight className="size-3" />
            Débloquer avec un plan payant
          </Link>
        </div>
      ) : (
        <>
          {newKey && (
            <Alert>
              <AlertDescription className="flex flex-col gap-2">
                <span>Copiez cette clé maintenant — elle ne sera plus jamais affichée en entier :</span>
                <div className="flex items-center gap-2">
                  <Input value={newKey} readOnly className="flex-1 font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={copyKey} aria-label="Copier la clé">
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} noValidate className="flex items-end gap-2">
            <Field className="flex-1" data-invalid={!!errors.name}>
              <Input placeholder="Nom de la clé (ex: Intégration Zapier)" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              <KeyRound className="size-4" />
              Générer
            </Button>
          </form>
        </>
      )}

      <div className="flex flex-col gap-2">
        {activeKeys.map((key) => (
          <div key={key.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{key.name}</p>
              <p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}…</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(key.createdAt))}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => setRevokingId(key.id)}
                aria-label="Révoquer la clé"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {activeKeys.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucune clé API pour le moment.</p>
        )}
      </div>

      <ConfirmDialog
        open={revokingId !== null}
        onOpenChange={(open) => !open && setRevokingId(null)}
        title="Révoquer cette clé ?"
        description="Cette action est irréversible."
        confirmLabel="Révoquer"
        loading={isPending}
        onConfirm={() => {
          if (!revokingId) return;
          startTransition(async () => {
            await revokeApiKeyAction(revokingId);
            setRevokingId(null);
            router.refresh();
            toast.success("Clé API révoquée.");
          });
        }}
      />
    </div>
  );
}
