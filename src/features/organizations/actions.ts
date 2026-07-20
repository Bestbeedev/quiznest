"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { createOrganizationSchema } from "@/lib/validators/organization";
import { createOrganizationForUser } from "@/lib/services/organization";
import { logAudit } from "@/lib/services/audit-log";
import { getPlatformSettings } from "@/lib/services/platform-settings";
import { sendEmail } from "@/lib/email/resend";
import { buildNewOrganizationNotificationEmail } from "@/emails/new-organization-notification";
import { ValidationError } from "@/lib/errors";

export async function createOrganizationAction(input: unknown, redirectTo?: string) {
  const session = await requireAuth();
  const parsed = createOrganizationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  let organizationId: string;
  try {
    const organization = await createOrganizationForUser(session.user.id, parsed.data);
    organizationId = organization.id;
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  const headerList = await headers();
  await logAudit({
    action: "ORGANIZATION_CREATED",
    organizationId,
    userId: session.user.id,
    resource: { name: parsed.data.name, slug: parsed.data.slug },
    ipAddress: headerList.get("x-forwarded-for"),
    userAgent: headerList.get("user-agent"),
  });

  const platformSettings = await getPlatformSettings();
  if (platformSettings.notifyOnNewOrganization && platformSettings.notificationEmail) {
    const { subject, html, text } = buildNewOrganizationNotificationEmail({
      organizationName: parsed.data.name,
      organizationSlug: parsed.data.slug,
      ownerEmail: session.user.email,
    });
    await sendEmail({ to: platformSettings.notificationEmail, subject, html, text }).catch((error) =>
      console.error("[notifications] failed to send new-organization email", error),
    );
  }

  redirect(redirectTo || "/dashboard");
}
