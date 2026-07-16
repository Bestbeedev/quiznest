import "server-only";
import { prisma } from "@/lib/db/client";

export async function getPlatformStats() {
  const [organizations, users, quizzes] = await Promise.all([
    prisma.organization.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.quiz.count({ where: { deletedAt: null } }),
  ]);

  return { organizations, users, quizzes };
}

export async function listAllOrganizations() {
  return prisma.organization.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true, quizzes: true } } },
  });
}

export async function listAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });
}
