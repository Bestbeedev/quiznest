import "server-only";
import { prisma } from "@/lib/db/client";
import type { AuditAction } from "@/generated/prisma/client";

type JsonPrimitive = string | number | boolean | null;

/** Fire-and-forget-safe: logging must never break the mutation it documents,
 * so failures are swallowed (and reported to console) rather than thrown. */
export async function logAudit(input: {
  action: AuditAction;
  organizationId?: string | null;
  userId?: string | null;
  resource?: Record<string, JsonPrimitive>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        organizationId: input.organizationId ?? null,
        userId: input.userId ?? null,
        resource: input.resource ?? undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("[audit-log] failed to record", input.action, error);
  }
}

export async function listAuditLogs(limit = 200, organizationId?: string) {
  return prisma.auditLog.findMany({
    where: organizationId ? { organizationId } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      organization: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
