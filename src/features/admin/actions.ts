"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { updatePlatformSettingsSchema } from "@/lib/validators/platform-settings";
import { updatePlatformSettings } from "@/lib/services/platform-settings";
import { logAudit } from "@/lib/services/audit-log";

export async function updatePlatformSettingsAction(input: unknown) {
  const session = await requireSuperAdmin();
  const parsed = updatePlatformSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  await updatePlatformSettings(parsed.data, session.user.id);

  const headerList = await headers();
  await logAudit({
    action: "PLATFORM_SETTINGS_UPDATED",
    userId: session.user.id,
    resource: parsed.data,
    ipAddress: headerList.get("x-forwarded-for"),
    userAgent: headerList.get("user-agent"),
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true as const };
}
