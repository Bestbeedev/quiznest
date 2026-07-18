"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import {
  profileSchema,
  passwordSchema,
  notificationPreferencesSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  createApiKeySchema,
} from "@/lib/validators/settings";
import * as userService from "@/lib/services/user";
import * as organizationService from "@/lib/services/organization";
import * as invitationService from "@/lib/services/invitation";
import * as apiKeyService from "@/lib/services/api-key";
import { AppError } from "@/lib/errors";
import type { MemberRole } from "@/generated/prisma/client";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof AppError ? error.message : fallback;
}

export async function updateProfileAction(input: unknown) {
  const session = await requireAuth();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await userService.updateProfile(session.user.id, await headers(), parsed.data);
  } catch (error) {
    return { error: errorMessage(error, "Impossible de mettre à jour le profil.") };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function changePasswordAction(input: unknown) {
  await requireAuth();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await userService.changeUserPassword(await headers(), parsed.data);
  } catch (error) {
    return { error: errorMessage(error, "Mot de passe actuel incorrect.") };
  }

  return { success: true };
}

export async function updateNotificationPreferencesAction(input: unknown) {
  const session = await requireAuth();
  const parsed = notificationPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Entrée invalide." };
  }

  await userService.updateNotificationPreferences(session.user.id, parsed.data);
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function listSessionsAction() {
  await requireAuth();
  return userService.listUserSessions(await headers());
}

export async function revokeSessionAction(token: string) {
  await requireAuth();
  await userService.revokeUserSession(await headers(), token);
  revalidatePath("/dashboard/settings");
}

export async function revokeOtherSessionsAction() {
  await requireAuth();
  await userService.revokeOtherUserSessions(await headers());
  revalidatePath("/dashboard/settings");
}

export async function updateOrganizationAction(input: unknown) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await organizationService.updateOrganization(organization.id, parsed.data);
  } catch (error) {
    return { error: errorMessage(error, "Impossible de mettre à jour l'organisation.") };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

const CHANGEABLE_ROLES = ["OWNER", "ADMIN", "MANAGER", "EDITOR", "VIEWER"] as const;

export async function changeMemberRoleAction(memberId: string, role: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();

  if (!(CHANGEABLE_ROLES as readonly string[]).includes(role)) {
    return { error: "Rôle invalide." };
  }

  try {
    await organizationService.changeMemberRole(organization.id, session.user.id, memberId, role as MemberRole);
  } catch (error) {
    return { error: errorMessage(error, "Impossible de modifier le rôle.") };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function removeMemberAction(memberId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();

  try {
    await organizationService.removeMember(organization.id, session.user.id, memberId);
  } catch (error) {
    return { error: errorMessage(error, "Impossible de retirer ce membre.") };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function inviteMemberAction(input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    const invitation = await invitationService.createInvitation(
      organization.id,
      session.user.id,
      parsed.data.email,
      parsed.data.role,
    );
    revalidatePath("/dashboard/settings");
    return { success: true, token: invitation.token };
  } catch (error) {
    return { error: errorMessage(error, "Impossible de créer l'invitation.") };
  }
}

export async function revokeInvitationAction(invitationId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await invitationService.revokeInvitation(organization.id, session.user.id, invitationId);
  revalidatePath("/dashboard/settings");
}

export async function acceptInvitationAction(token: string) {
  const session = await requireAuth();

  try {
    await invitationService.acceptInvitation(token, session.user.id);
  } catch (error) {
    return { error: errorMessage(error, "Impossible d'accepter l'invitation.") };
  }

  return { success: true };
}

export async function createApiKeyAction(input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const parsed = createApiKeySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    const { fullKey } = await apiKeyService.createApiKey(organization.id, session.user.id, parsed.data.name);
    revalidatePath("/dashboard/settings");
    return { success: true, key: fullKey };
  } catch (error) {
    return { error: errorMessage(error, "Impossible de créer la clé.") };
  }
}

export async function revokeApiKeyAction(keyId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await apiKeyService.revokeApiKey(organization.id, session.user.id, keyId);
  revalidatePath("/dashboard/settings");
}
