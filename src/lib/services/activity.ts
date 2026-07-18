import "server-only";

import { listAuditLogs } from "@/lib/services/audit-log";
import { getRecentOrganizations, getRecentUsers } from "@/lib/services/admin";
import { getRecentPayments } from "@/lib/services/billing";
import { getRecentOrgParticipants } from "@/lib/services/participation";

export type ActivityItem =
  | { type: "audit"; id: string; createdAt: Date; label: string; detail: string | null }
  | { type: "user_signup"; id: string; createdAt: Date; label: string; detail: string | null }
  | { type: "org_created"; id: string; createdAt: Date; label: string; detail: string | null }
  | { type: "payment"; id: string; createdAt: Date; label: string; detail: string | null };

const AUDIT_ACTION_LABELS: Record<string, string> = {
  ORGANIZATION_CREATED: "Organisation créée",
  QUIZ_CREATED: "Quiz créé",
  QUIZ_PUBLISHED: "Quiz publié",
  QUIZ_ARCHIVED: "Quiz archivé",
  QUIZ_DUPLICATED: "Quiz dupliqué",
  QUIZ_DELETED: "Quiz supprimé",
};

/** Merges audit logs, signups, org creations, and successful payments into one
 * chronological feed for the human-facing "Activité" page. `logs` (the raw
 * audit trail) stays a separate, filterable page — this is the curated view. */
export async function getRecentActivity(limit = 20): Promise<ActivityItem[]> {
  const [auditLogs, users, organizations, payments] = await Promise.all([
    listAuditLogs(limit),
    getRecentUsers(limit),
    getRecentOrganizations(limit),
    getRecentPayments(limit),
  ]);

  const items: ActivityItem[] = [
    ...auditLogs.map((log) => ({
      type: "audit" as const,
      id: log.id,
      createdAt: log.createdAt,
      label: AUDIT_ACTION_LABELS[log.action] ?? log.action,
      detail: [log.user?.name, log.organization?.name].filter(Boolean).join(" · ") || null,
    })),
    ...users.map((user) => ({
      type: "user_signup" as const,
      id: user.id,
      createdAt: user.createdAt,
      label: "Nouvel utilisateur",
      detail: `${user.name} (${user.email})`,
    })),
    ...organizations.map((org) => ({
      type: "org_created" as const,
      id: org.id,
      createdAt: org.createdAt,
      label: "Nouvelle organisation",
      detail: org.name,
    })),
    ...payments.map((payment) => ({
      type: "payment" as const,
      id: payment.id,
      createdAt: payment.createdAt,
      label: "Paiement reçu",
      detail: `${payment.organization.name} — ${payment.amount} ${payment.currency}`,
    })),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

const PARTICIPANT_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Tentative terminée",
  IN_PROGRESS: "Tentative en cours",
  ABANDONED: "Tentative abandonnée",
};

export type OrgActivityItem =
  | { type: "audit"; id: string; createdAt: Date; label: string; detail: string | null }
  | { type: "participant"; id: string; createdAt: Date; label: string; detail: string | null };

/** Org-scoped equivalent of `getRecentActivity` — every source here is filtered
 * by `organizationId`, unlike the platform-wide admin feed above, so this is
 * safe to show to a regular org member without leaking other tenants' data. */
export async function getOrgRecentActivity(organizationId: string, limit = 10): Promise<OrgActivityItem[]> {
  const [auditLogs, participants] = await Promise.all([
    listAuditLogs(limit, organizationId),
    getRecentOrgParticipants(organizationId, limit),
  ]);

  const items: OrgActivityItem[] = [
    ...auditLogs.map((log) => ({
      type: "audit" as const,
      id: log.id,
      createdAt: log.createdAt,
      label: AUDIT_ACTION_LABELS[log.action] ?? log.action,
      detail: log.user?.name ?? null,
    })),
    ...participants.map((participant) => ({
      type: "participant" as const,
      id: participant.id,
      createdAt: participant.startedAt,
      label: PARTICIPANT_STATUS_LABELS[participant.status] ?? participant.status,
      detail: `${participant.name} — ${participant.quiz.title}`,
    })),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}
