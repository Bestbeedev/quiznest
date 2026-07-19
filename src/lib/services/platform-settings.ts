import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db/client";
import type { UpdatePlatformSettingsInput } from "@/lib/validators/platform-settings";

const SETTINGS_ID = "singleton";

/** React-cached per request (same pattern as getCurrentOrganization in
 * lib/db/tenant.ts) — this is read on nearly every page render for the
 * maintenance gate, so it must stay a single indexed primary-key lookup. */
export const getPlatformSettings = cache(async () => {
  const existing = await prisma.platformSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.platformSettings.create({ data: { id: SETTINGS_ID } });
});

export async function updatePlatformSettings(input: UpdatePlatformSettingsInput, updatedBy: string) {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...input, updatedBy },
    update: { ...input, updatedBy },
  });
}

export async function checkDatabaseHealth() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true as const, latencyMs: Date.now() - start };
  } catch {
    return { healthy: false as const, latencyMs: Date.now() - start };
  }
}
