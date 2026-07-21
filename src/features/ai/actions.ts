"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import { aiSettingsSchema } from "@/lib/validators/ai-settings";
import * as aiSettingsService from "@/lib/services/ai-settings";
import * as conversationService from "@/lib/services/ai-conversation";
import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

function handleKnownErrors(error: unknown) {
  if (error instanceof ValidationError || error instanceof ForbiddenError || error instanceof NotFoundError) {
    return { error: error.message };
  }
  throw error;
}

export async function saveAiSettingsAction(input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();

  const parsed = aiSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await aiSettingsService.saveAiSettings(organization.id, session.user.id, parsed.data);
  } catch (error) {
    return handleKnownErrors(error);
  }

  revalidatePath("/dashboard/ai");
  return { success: true as const };
}

export async function clearAiSettingsAction() {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();

  try {
    await aiSettingsService.clearAiSettings(organization.id, session.user.id);
  } catch (error) {
    return handleKnownErrors(error);
  }

  revalidatePath("/dashboard/ai");
  return { success: true as const };
}

export async function createConversationAction(quizId?: string | null, title?: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  const conversation = await conversationService.createConversation(organization.id, session.user.id, { quizId, title });
  revalidatePath("/dashboard/ai");
  return { conversation };
}

export async function listConversationsAction() {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  return conversationService.listConversations(organization.id, session.user.id);
}

export async function getConversationAction(conversationId: string) {
  const organization = await requireActiveOrganization();
  try {
    return { conversation: await conversationService.getConversation(organization.id, conversationId) };
  } catch (error) {
    return handleKnownErrors(error);
  }
}

export async function renameConversationAction(conversationId: string, title: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  if (!title.trim()) return { error: "Le nom ne peut pas être vide." };
  try {
    await conversationService.renameConversation(organization.id, conversationId, title);
  } catch (error) {
    return handleKnownErrors(error);
  }
  revalidatePath("/dashboard/ai");
  return { success: true as const };
}

export async function associateQuizAction(conversationId: string, quizId: string | null) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  try {
    await conversationService.associateQuiz(organization.id, conversationId, quizId);
  } catch (error) {
    return handleKnownErrors(error);
  }
  revalidatePath("/dashboard/ai");
  return { success: true as const };
}

export async function deleteConversationAction(conversationId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  try {
    await conversationService.deleteConversation(organization.id, conversationId);
  } catch (error) {
    return handleKnownErrors(error);
  }
  revalidatePath("/dashboard/ai");
  return { success: true as const };
}
