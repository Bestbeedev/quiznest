import "server-only";
import { prisma } from "@/lib/db/client";

export async function getPlatformStats() {
  const [organizations, users, quizzes, activeSubscriptions] = await Promise.all([
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.quiz.count({ where: { deletedAt: null } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  return { organizations, users, quizzes, activeSubscriptions };
}

export async function listAllOrganizations() {
  return prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, quizzes: true } },
      subscription: { include: { plan: { select: { name: true } } } },
    },
  });
}

export async function listAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });
}

export async function getRecentUsers(limit = 5) {
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, email: true, createdAt: true },
  });
}

export async function getRecentOrganizations(limit = 5) {
  return prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, slug: true, createdAt: true },
  });
}

/** Weekly platform-wide signups vs org creations, zero-filled — `generate_series`
 * anchors the week boundaries so both series line up on the same axis. */
export async function getWeeklyGrowthTrend(weeks = 8) {
  const rows = await prisma.$queryRaw<{ week: Date; users: number; organisations: number }[]>`
    SELECT
      gs.week AS week,
      COALESCE(u.count, 0)::int AS users,
      COALESCE(o.count, 0)::int AS organisations
    FROM generate_series(
      date_trunc('week', now()) - ((${weeks}::int - 1) * interval '7 day'),
      date_trunc('week', now()),
      interval '7 day'
    ) AS gs(week)
    LEFT JOIN (
      SELECT date_trunc('week', created_at) AS week, count(*) AS count
      FROM users WHERE deleted_at IS NULL GROUP BY 1
    ) u ON u.week = gs.week
    LEFT JOIN (
      SELECT date_trunc('week', created_at) AS week, count(*) AS count
      FROM organizations WHERE deleted_at IS NULL GROUP BY 1
    ) o ON o.week = gs.week
    ORDER BY gs.week ASC
  `;

  return rows.map((row) => ({
    date: row.week.toISOString().slice(0, 10),
    users: row.users,
    organisations: row.organisations,
  }));
}
