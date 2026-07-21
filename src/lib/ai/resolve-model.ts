import "server-only";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

import { prisma } from "@/lib/db/client";
import { decryptSecret } from "@/lib/crypto/secret-box";

const DEFAULT_PLATFORM_BASE_URL = "https://opencode.ai/zen/v1";
const DEFAULT_PLATFORM_MODEL = "big-pickle";
const DEFAULT_BYOK_ANTHROPIC_MODEL = "claude-sonnet-4-5";
const DEFAULT_BYOK_OPENAI_MODEL = "gpt-4o-mini";

export type ResolvedAiModel = {
  model: LanguageModel;
  /** True when the platform's own key/quota is used — callers must meter the
   * AI_GENERATION feature. False for BYOK: the organization's own provider
   * account is billed directly, so no platform quota is consumed. */
  meterPlatformQuota: boolean;
  providerLabel: string;
};

/**
 * Single seam business code depends on to get a ready-to-use `LanguageModel`
 * — mirrors the `PaymentProvider` boundary (`src/lib/payments/provider.ts`):
 * callers never construct an AI SDK provider directly. Resolves an
 * organization's own BYOK settings first, falling back to the platform's
 * default key (`AI_PROVIDER_API_KEY`, an OpenAI-compatible gateway).
 */
export async function resolveAiModel(organizationId: string): Promise<ResolvedAiModel> {
  const settings = await prisma.organizationAiSettings.findUnique({ where: { organizationId } });

  if (settings && settings.provider !== "PLATFORM" && settings.encryptedApiKey) {
    const apiKey = decryptSecret(settings.encryptedApiKey);

    if (settings.provider === "ANTHROPIC") {
      const anthropic = createAnthropic({ apiKey });
      return {
        model: anthropic(settings.model || DEFAULT_BYOK_ANTHROPIC_MODEL),
        meterPlatformQuota: false,
        providerLabel: "Anthropic (clé personnelle)",
      };
    }

    const baseURL = settings.baseUrl || "https://api.openai.com/v1";
    const provider = createOpenAICompatible({ name: "org-byok", baseURL, apiKey });
    return {
      model: provider(settings.model || DEFAULT_BYOK_OPENAI_MODEL),
      meterPlatformQuota: false,
      providerLabel: `${baseURL} (clé personnelle)`,
    };
  }

  const platformKey = process.env.AI_PROVIDER_API_KEY;
  if (!platformKey) {
    throw new Error(
      "Aucune clé IA disponible : la plateforme n'a pas de clé par défaut et cette organisation n'a pas configuré sa propre clé.",
    );
  }

  const provider = createOpenAICompatible({
    name: "platform",
    baseURL: process.env.AI_PROVIDER_BASE_URL || DEFAULT_PLATFORM_BASE_URL,
    apiKey: platformKey,
  });
  return {
    model: provider(process.env.AI_PROVIDER_MODEL || DEFAULT_PLATFORM_MODEL),
    meterPlatformQuota: true,
    providerLabel: "QuizNest IA",
  };
}
