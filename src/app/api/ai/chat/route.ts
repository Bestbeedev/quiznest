import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { streamObject } from "ai";

import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { canUseFeature } from "@/lib/services/feature-gate";
import { incrementFeatureUsage } from "@/lib/services/feature-usage";
import { resolveAiModel } from "@/lib/ai/resolve-model";
import { aiChatTurnSchema } from "@/lib/ai/chat-schema";
import { buildChatSystemPrompt } from "@/lib/ai/chat-system-prompt";
import * as conversationService from "@/lib/services/ai-conversation";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import type { FeatureKey } from "@/generated/prisma/client";

export const maxDuration = 60;

const requestSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000),
});

/**
 * Route Handler (not a Server Action) because streaming a partial-object
 * response to `useObject` on the client needs a plain fetch endpoint the AI
 * SDK can read as a text stream — a deliberate, narrow exception to "Route
 * Handlers reserved for public API/webhooks", justified by that streaming
 * requirement rather than public exposure (auth/tenant/role checks below are
 * identical to any Server Action in this codebase).
 */
export async function POST(req: NextRequest) {
  let session, organization;
  try {
    session = await requireAuth();
    organization = await requireActiveOrganization();
    await requireOrgRole(organization.id, session.user.id, "EDITOR");
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
    if (error instanceof NotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    throw error;
  }

  const parsedBody = requestSchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { conversationId, message } = parsedBody.data;

  const conversation = await conversationService
    .getConversation(organization.id, conversationId)
    .catch(() => null);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 });
  }

  const platformSettings = await getPlatformSettings();
  if (!platformSettings.aiGeneration) {
    return NextResponse.json(
      { error: "La génération de questions par IA est désactivée par l'administrateur de la plateforme." },
      { status: 403 },
    );
  }

  let resolved;
  try {
    resolved = await resolveAiModel(organization.id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur IA." }, { status: 500 });
  }

  // BYOK bypasses the platform quota entirely — only platform-key usage is metered.
  const featureCheck = await canUseFeature(organization.id, "AI_GENERATION" as FeatureKey);
  if (resolved.meterPlatformQuota && !featureCheck.allowed) {
    return NextResponse.json(
      {
        error:
          "Quota IA mensuel atteint. Passez à un plan supérieur, achetez un Pack IA, ou configurez votre propre clé API dans les réglages IA.",
      },
      { status: 402 },
    );
  }

  await conversationService.addMessage(conversationId, "USER", message);

  const history = conversation.messages.map((m) => ({
    role: (m.role === "USER" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  const result = streamObject({
    model: resolved.model,
    schema: aiChatTurnSchema,
    system: buildChatSystemPrompt(conversation.quiz?.title ?? null),
    messages: [...history, { role: "user" as const, content: message }],
    onFinish: async ({ object }) => {
      if (!object) return;
      await conversationService.addMessage(conversationId, "ASSISTANT", object.reply, object.questions ?? undefined);
      if (resolved.meterPlatformQuota && object.questions?.length) {
        await incrementFeatureUsage(organization.id, "AI_GENERATION" as FeatureKey, object.questions.length);
      }
    },
  });

  return result.toTextStreamResponse();
}
