import "server-only";
import { prisma } from "@/lib/db/client";
import { NotFoundError } from "@/lib/errors";
import type { AiMessageRole } from "@/generated/prisma/client";

export async function listConversations(organizationId: string, userId: string) {
  return prisma.aiConversation.findMany({
    where: { organizationId, userId },
    orderBy: { updatedAt: "desc" },
    include: { quiz: { select: { id: true, title: true } } },
  });
}

export async function getConversation(organizationId: string, conversationId: string) {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      quiz: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) throw new NotFoundError("Conversation introuvable.");
  return conversation;
}

export async function createConversation(
  organizationId: string,
  userId: string,
  input: { title?: string; quizId?: string | null },
) {
  return prisma.aiConversation.create({
    data: {
      organizationId,
      userId,
      quizId: input.quizId ?? null,
      title: input.title?.trim() || "Nouvelle conversation",
    },
  });
}

export async function renameConversation(organizationId: string, conversationId: string, title: string) {
  const conversation = await prisma.aiConversation.findFirst({ where: { id: conversationId, organizationId } });
  if (!conversation) throw new NotFoundError("Conversation introuvable.");
  return prisma.aiConversation.update({ where: { id: conversationId }, data: { title: title.trim() } });
}

export async function associateQuiz(organizationId: string, conversationId: string, quizId: string | null) {
  const conversation = await prisma.aiConversation.findFirst({ where: { id: conversationId, organizationId } });
  if (!conversation) throw new NotFoundError("Conversation introuvable.");
  return prisma.aiConversation.update({ where: { id: conversationId }, data: { quizId } });
}

export async function deleteConversation(organizationId: string, conversationId: string) {
  const conversation = await prisma.aiConversation.findFirst({ where: { id: conversationId, organizationId } });
  if (!conversation) throw new NotFoundError("Conversation introuvable.");
  await prisma.aiConversation.delete({ where: { id: conversationId } });
}

export async function addMessage(
  conversationId: string,
  role: AiMessageRole,
  content: string,
  proposedQuestions?: unknown,
) {
  const [message] = await prisma.$transaction([
    prisma.aiMessage.create({
      data: { conversationId, role, content, proposedQuestions: proposedQuestions ?? undefined },
    }),
    prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);
  return message;
}
