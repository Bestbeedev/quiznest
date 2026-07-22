"use client";

import { useState } from "react";
import { toast } from "sonner";

import { saveAiSettingsAction, clearAiSettingsAction } from "@/features/ai/actions";
import type { AiSettingsView } from "@/lib/services/ai-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const PROVIDER_LABELS: Record<AiSettingsView["provider"], string> = {
  PLATFORM: "QuizNest (par défaut)",
  OPENAI_COMPATIBLE: "Compatible OpenAI (OpenRouter, OpenAI, DeepSeek...)",
  ANTHROPIC: "Anthropic (Claude)",
};

export function AiSettingsForm({
  initialSettings,
  readOnly,
}: {
  initialSettings: AiSettingsView;
  readOnly: boolean;
}) {
  const [provider, setProvider] = useState(initialSettings.provider);
  const [baseUrl, setBaseUrl] = useState(initialSettings.baseUrl ?? "https://opencode.ai/zen/v1");
  const [model, setModel] = useState(initialSettings.model ?? "");
  const [apiKey, setApiKey] = useState("");
  const [keyPreview, setKeyPreview] = useState(initialSettings.keyPreview);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveAiSettingsAction({ provider, baseUrl, model, apiKey });
    setSaving(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Réglages IA enregistrés.");
    if (apiKey) {
      setKeyPreview(`${apiKey.slice(0, 4)}••••••••${apiKey.slice(-4)}`);
      setApiKey("");
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const result = await clearAiSettingsAction();
    setSaving(false);
    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }
    setProvider("PLATFORM");
    setBaseUrl("https://opencode.ai/zen/v1");
    setModel("");
    setApiKey("");
    setKeyPreview(null);
    toast.success("Réglages IA réinitialisés — QuizNest par défaut utilisé.");
  };

  return (
    <fieldset disabled={readOnly} className="flex flex-col gap-4 disabled:opacity-60">
      <FieldGroup>
        <Field>
          <FieldLabel>Fournisseur</FieldLabel>
          <Select value={provider} onValueChange={(v) => setProvider(v as AiSettingsView["provider"])} items={PROVIDER_LABELS}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROVIDER_LABELS) as AiSettingsView["provider"][]).map((key) => (
                <SelectItem key={key} value={key}>
                  {PROVIDER_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {provider === "PLATFORM"
              ? "Utilise la clé et le quota de QuizNest, selon votre plan."
              : "Vos appels sont facturés directement sur votre propre compte, sans limite de quota QuizNest."}
          </FieldDescription>
        </Field>

        {provider === "OPENAI_COMPATIBLE" && (
          <Field>
            <FieldLabel htmlFor="ai-base-url">URL de base de l&apos;API</FieldLabel>
            <Input
              id="ai-base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://opencode.ai/zen/v1"
            />
            <FieldDescription>
              Ex : OpenCode Zen (https://opencode.ai/zen/v1), OpenRouter (https://openrouter.ai/api/v1), OpenAI (https://api.openai.com/v1).
            </FieldDescription>
          </Field>
        )}

        {provider !== "PLATFORM" && (
          <Field>
            <FieldLabel htmlFor="ai-model">Modèle</FieldLabel>
            <Input
              id="ai-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={provider === "ANTHROPIC" ? "claude-sonnet-4-5" : "big-pickle"}
            />
          </Field>
        )}

        {provider !== "PLATFORM" && (
          <Field>
            <FieldLabel htmlFor="ai-api-key">Clé API</FieldLabel>
            <Input
              id="ai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={keyPreview ?? "sk-..."}
            />
            <FieldDescription>
              {keyPreview ? (
                <>
                  Clé actuelle : <Badge variant="outline">{keyPreview}</Badge> — laissez vide pour la conserver.
                </>
              ) : (
                "Votre clé est chiffrée avant stockage et n'est jamais affichée en clair."
              )}
            </FieldDescription>
          </Field>
        )}
      </FieldGroup>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={handleSave} disabled={saving}>
          Enregistrer
        </Button>
        {keyPreview && (
          <Button type="button" variant="outline" onClick={handleReset} disabled={saving}>
            Revenir à QuizNest par défaut
          </Button>
        )}
      </div>
    </fieldset>
  );
}
