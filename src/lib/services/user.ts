import "server-only";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

export type ProfileInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  image?: string;
  timezone: string;
  language: string;
};

/** Syncs `name`/`firstName`/`lastName`/`image` through better-auth's own API
 * (so its session cache stays consistent) and persists the rest — fields
 * better-auth doesn't know about — directly via Prisma. */
export async function updateProfile(userId: string, headerList: Headers, input: ProfileInput) {
  const name = `${input.firstName} ${input.lastName}`.trim();

  await auth.api.updateUser({
    headers: headerList,
    body: {
      name,
      firstName: input.firstName,
      lastName: input.lastName,
      image: input.image || undefined,
    },
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      name,
      phone: input.phone || null,
      image: input.image || null,
      timezone: input.timezone,
      language: input.language,
    },
  });
}

export async function changeUserPassword(
  headerList: Headers,
  input: { currentPassword: string; newPassword: string },
) {
  await auth.api.changePassword({
    headers: headerList,
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: true,
    },
  });
}

/** better-auth's `listSessions` requires a "fresh" session (re-authenticated
 * within the last 24h — `freshSessionMiddleware`) and throws otherwise. Most
 * real logins are older than that, so this degrades to `null` (rather than
 * throwing through to the page) whenever the session isn't fresh enough. */
export async function listUserSessions(headerList: Headers) {
  try {
    return await auth.api.listSessions({ headers: headerList });
  } catch {
    return null;
  }
}

export async function revokeUserSession(headerList: Headers, token: string) {
  await auth.api.revokeSession({ headers: headerList, body: { token } });
}

export async function revokeOtherUserSessions(headerList: Headers) {
  await auth.api.revokeOtherSessions({ headers: headerList });
}

export type NotificationPreferences = {
  quizResults: boolean;
  weeklyDigest: boolean;
  teamActivity: boolean;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  quizResults: true,
  weeklyDigest: false,
  teamActivity: true,
};

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { preferences: true } });
  const stored = (user.preferences as { notifications?: Partial<NotificationPreferences> } | null)?.notifications;
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...stored };
}

/** Stored for future use — no email provider is wired in this project yet
 * (see the "Bientôt" note surfaced next to this section in the UI), so these
 * preferences don't currently gate any actual delivery. */
export async function updateNotificationPreferences(userId: string, preferences: NotificationPreferences) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { preferences: true } });
  const current = (user.preferences as Record<string, unknown>) ?? {};
  return prisma.user.update({
    where: { id: userId },
    data: { preferences: { ...current, notifications: preferences } },
  });
}
