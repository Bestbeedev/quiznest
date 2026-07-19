"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { requireOrgRole } from "@/lib/auth/require-org-role";
import { createQuizSchema, updateQuizSettingsSchema } from "@/lib/validators/quiz";
import { createQuestionSchema } from "@/lib/validators/question";
import { aiImportSchema, aiImportQuestionSchema, toCreateQuestionInputs, toCreateQuestionInput } from "@/lib/validators/ai-import";
import * as quizService from "@/lib/services/quiz";
import * as questionService from "@/lib/services/question";
import { getParticipantAnswers } from "@/lib/services/participation";
import { logAudit } from "@/lib/services/audit-log";
import type { AuditAction } from "@/generated/prisma/client";

async function logQuizAction(
  action: AuditAction,
  organizationId: string,
  userId: string,
  quizId: string,
) {
  const headerList = await headers();
  await logAudit({
    action,
    organizationId,
    userId,
    resource: { quizId },
    ipAddress: headerList.get("x-forwarded-for"),
    userAgent: headerList.get("user-agent"),
  });
}

export async function createQuizAction(input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const parsed = createQuizSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  const quiz = await quizService.createQuiz(organization.id, session.user.id, parsed.data);
  await logQuizAction("QUIZ_CREATED", organization.id, session.user.id, quiz.id);
  revalidatePath("/dashboard/quiz");
  redirect(`/dashboard/quiz/${quiz.id}`);
}

export async function updateQuizSettingsAction(quizId: string, input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const parsed = updateQuizSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  await quizService.updateQuizSettings(organization.id, quizId, parsed.data);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  revalidatePath("/dashboard/quiz");
  return { success: true };
}

export async function publishQuizAction(quizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "MANAGER");
  await quizService.publishQuiz(organization.id, quizId);
  await logQuizAction("QUIZ_PUBLISHED", organization.id, session.user.id, quizId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  revalidatePath("/dashboard/quiz");
}

export async function archiveQuizAction(quizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "MANAGER");
  await quizService.archiveQuiz(organization.id, quizId);
  await logQuizAction("QUIZ_ARCHIVED", organization.id, session.user.id, quizId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  revalidatePath("/dashboard/quiz");
}

export async function duplicateQuizAction(quizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const duplicated = await quizService.duplicateQuiz(organization.id, quizId);
  await logQuizAction("QUIZ_DUPLICATED", organization.id, session.user.id, duplicated.id);
  revalidatePath("/dashboard/quiz");
}

export async function deleteQuizAction(quizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "ADMIN");
  await quizService.deleteQuiz(organization.id, quizId);
  await logQuizAction("QUIZ_DELETED", organization.id, session.user.id, quizId);
  revalidatePath("/dashboard/quiz");
}

async function logQuizActions(action: AuditAction, organizationId: string, userId: string, quizIds: string[]) {
  await Promise.all(quizIds.map((quizId) => logQuizAction(action, organizationId, userId, quizId)));
}

export async function bulkPublishQuizzesAction(quizIds: string[]) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "MANAGER");
  const published = await quizService.bulkPublishQuizzes(organization.id, quizIds);
  await logQuizActions("QUIZ_PUBLISHED", organization.id, session.user.id, published);
  revalidatePath("/dashboard/quiz");
  return { count: published.length };
}

export async function bulkArchiveQuizzesAction(quizIds: string[]) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "MANAGER");
  const archived = await quizService.bulkArchiveQuizzes(organization.id, quizIds);
  await logQuizActions("QUIZ_ARCHIVED", organization.id, session.user.id, archived);
  revalidatePath("/dashboard/quiz");
  return { count: archived.length };
}

export async function bulkDuplicateQuizzesAction(quizIds: string[]) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const duplicated = await quizService.bulkDuplicateQuizzes(organization.id, quizIds);
  await logQuizActions(
    "QUIZ_DUPLICATED",
    organization.id,
    session.user.id,
    duplicated.map((q) => q.id),
  );
  revalidatePath("/dashboard/quiz");
  return { count: duplicated.length };
}

export async function bulkDeleteQuizzesAction(quizIds: string[]) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "ADMIN");
  const deleted = await quizService.bulkDeleteQuizzes(organization.id, quizIds);
  await logQuizActions("QUIZ_DELETED", organization.id, session.user.id, deleted);
  revalidatePath("/dashboard/quiz");
  return { count: deleted.length };
}

export async function addQuestionAction(quizId: string, input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const parsed = createQuestionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  await questionService.addQuestion(organization.id, quizId, parsed.data);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  return { success: true };
}

export async function deleteQuestionAction(quizId: string, questionId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  await questionService.deleteQuestion(organization.id, quizId, questionId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
}

export async function getParticipantAnswersAction(quizId: string, participantId: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  return getParticipantAnswers(organization.id, quizId, participantId);
}

export async function updateQuestionAction(questionId: string, input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const parsed = createQuestionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  await questionService.updateQuestion(organization.id, questionId, parsed.data);
  revalidatePath("/dashboard/questions");
  revalidatePath("/dashboard/quiz");
  return { success: true };
}

export async function duplicateQuestionAction(questionId: string, targetQuizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  await questionService.duplicateQuestionToQuiz(organization.id, questionId, targetQuizId);
  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/quiz/${targetQuizId}`);
}

export async function moveQuestionAction(questionId: string, targetQuizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  await questionService.moveQuestionToQuiz(organization.id, questionId, targetQuizId);
  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/quiz/${targetQuizId}`);
}

export async function bulkDeleteQuestionsAction(questionIds: string[]) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "ADMIN");
  const deleted = await questionService.bulkDeleteQuestions(organization.id, questionIds);
  revalidatePath("/dashboard/questions");
  return { count: deleted.length };
}

export async function bulkMoveQuestionsAction(questionIds: string[], targetQuizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const moved = await questionService.bulkMoveQuestions(organization.id, questionIds, targetQuizId);
  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/quiz/${targetQuizId}`);
  return { count: moved.length };
}

export async function bulkDuplicateQuestionsAction(questionIds: string[], targetQuizId: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");
  const duplicated = await questionService.bulkDuplicateQuestions(organization.id, questionIds, targetQuizId);
  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/quiz/${targetQuizId}`);
  return { count: duplicated.length };
}

export async function importQuestionsFromJsonAction(quizId: string, rawJson: string) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawJson);
  } catch {
    return { error: "Le texte collé n'est pas un JSON valide." };
  }

  const parsed = aiImportSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Format JSON invalide." };
  }

  const inputs = toCreateQuestionInputs(parsed.data);
  await questionService.importQuestions(organization.id, quizId, inputs);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  return { success: true, count: inputs.length };
}

/** Imports one AI-generated question at a time (as opposed to
 * `importQuestionsFromJsonAction`'s single all-or-nothing transaction) so the
 * client can show real-time per-question progress and surface each failure
 * individually instead of aborting the whole batch on the first bad item. */
export async function importAiQuestionAction(quizId: string, rawQuestion: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  await requireOrgRole(organization.id, session.user.id, "EDITOR");

  const parsed = aiImportQuestionSchema.safeParse(rawQuestion);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Question invalide." };
  }

  const input = toCreateQuestionInput(parsed.data);
  const created = await questionService.addQuestion(organization.id, quizId, input);
  revalidatePath(`/dashboard/quiz/${quizId}`);

  return {
    success: true as const,
    question: {
      id: created.id,
      title: input.title,
      type: input.type,
      difficulty: input.difficulty,
      points: input.points,
      hint: input.hint,
      timeLimit: input.timeLimit,
      explanation: input.explanation,
      category: input.category,
      tags: input.tags,
      choices: input.choices,
    },
  };
}
