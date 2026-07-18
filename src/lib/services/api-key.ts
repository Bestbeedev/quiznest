import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";
import { requireOrgRole } from "@/lib/auth/require-org-role";

const KEY_PREFIX = "qn_live_";

function hashKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/** Storage/management only — see the model comment in schema.prisma. Returns
 * the full plaintext key exactly once; only its SHA-256 hash and a short
 * prefix (for display: "qn_live_ab12…") are ever persisted. */
export async function createApiKey(organizationId: string, actorUserId: string, name: string) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  const secret = randomBytes(24).toString("base64url");
  const fullKey = `${KEY_PREFIX}${secret}`;
  const keyPrefix = fullKey.slice(0, KEY_PREFIX.length + 6);

  const record = await prisma.apiKey.create({
    data: {
      organizationId,
      name,
      keyPrefix,
      keyHash: hashKey(fullKey),
      createdBy: actorUserId,
    },
  });

  return { record, fullKey };
}

export async function listApiKeys(organizationId: string) {
  return prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } } },
  });
}

export async function revokeApiKey(organizationId: string, actorUserId: string, keyId: string) {
  await requireOrgRole(organizationId, actorUserId, "ADMIN");

  const key = await prisma.apiKey.findFirst({ where: { id: keyId, organizationId } });
  if (!key) throw new NotFoundError("Clé introuvable.");

  await prisma.apiKey.update({ where: { id: keyId }, data: { revokedAt: new Date() } });
}
