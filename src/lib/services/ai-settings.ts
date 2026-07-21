import "server-only";
import { prisma } from "@/lib/db/client";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import { encryptSecret, maskSecret } from "@/lib/crypto/secret-box";
import { ValidationError } from "@/lib/errors";
import type { AiSettingsInput } from "@/lib/validators/ai-settings";

export type AiSettingsView = {
  provider: "PLATFORM" | "OPENAI_COMPATIBLE" | "ANTHROPIC";
  baseUrl: string | null;
  model: string | null;
  hasCustomKey: boolean;
  keyPreview: string | null;
};

export async function getAiSettings(organizationId: string): Promise<AiSettingsView> {
  const settings = await prisma.organizationAiSettings.findUnique({ where: { organizationId } });
  if (!settings) {
    return { provider: "PLATFORM", baseUrl: null, model: null, hasCustomKey: false, keyPreview: null };
  }
  return {
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    model: settings.model,
    hasCustomKey: Boolean(settings.encryptedApiKey),
    keyPreview: settings.keyPreview,
  };
}

export async function saveAiSettings(organizationId: string, actorUserId: string, input: AiSettingsInput) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  const existing = await prisma.organizationAiSettings.findUnique({ where: { organizationId } });

  if (input.provider === "PLATFORM") {
    await prisma.organizationAiSettings.upsert({
      where: { organizationId },
      create: { organizationId, provider: "PLATFORM" },
      update: { provider: "PLATFORM", baseUrl: null, model: null, encryptedApiKey: null, keyPreview: null },
    });
    return;
  }

  if (!input.apiKey && !existing?.encryptedApiKey) {
    throw new ValidationError("Une clé API est requise pour utiliser votre propre fournisseur.");
  }

  await prisma.organizationAiSettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      provider: input.provider,
      baseUrl: input.baseUrl || null,
      model: input.model || null,
      encryptedApiKey: input.apiKey ? encryptSecret(input.apiKey) : null,
      keyPreview: input.apiKey ? maskSecret(input.apiKey) : null,
    },
    update: {
      provider: input.provider,
      baseUrl: input.baseUrl || null,
      model: input.model || null,
      // Keep the existing encrypted key/preview when the field is left blank
      // (user is only changing model/baseUrl, not rotating the key).
      ...(input.apiKey ? { encryptedApiKey: encryptSecret(input.apiKey), keyPreview: maskSecret(input.apiKey) } : {}),
    },
  });
}

export async function clearAiSettings(organizationId: string, actorUserId: string) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");
  await prisma.organizationAiSettings.upsert({
    where: { organizationId },
    create: { organizationId, provider: "PLATFORM" },
    update: { provider: "PLATFORM", baseUrl: null, model: null, encryptedApiKey: null, keyPreview: null },
  });
}
