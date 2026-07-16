"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { createQuizSchema, updateQuizSettingsSchema } from "@/lib/validators/quiz";
import { createQuestionSchema } from "@/lib/validators/question";
import * as quizService from "@/lib/services/quiz";
import * as questionService from "@/lib/services/question";

export async function createQuizAction(input: unknown) {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const parsed = createQuizSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  const quiz = await quizService.createQuiz(organization.id, session.user.id, parsed.data);
  revalidatePath("/dashboard/quiz");
  redirect(`/dashboard/quiz/${quiz.id}`);
}

export async function updateQuizSettingsAction(quizId: string, input: unknown) {
  await requireAuth();
  const organization = await requireActiveOrganization();
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
  await requireAuth();
  const organization = await requireActiveOrganization();
  await quizService.publishQuiz(organization.id, quizId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  revalidatePath("/dashboard/quiz");
}

export async function archiveQuizAction(quizId: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  await quizService.archiveQuiz(organization.id, quizId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  revalidatePath("/dashboard/quiz");
}

export async function duplicateQuizAction(quizId: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  await quizService.duplicateQuiz(organization.id, quizId);
  revalidatePath("/dashboard/quiz");
}

export async function deleteQuizAction(quizId: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  await quizService.deleteQuiz(organization.id, quizId);
  revalidatePath("/dashboard/quiz");
}

export async function addQuestionAction(quizId: string, input: unknown) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  const parsed = createQuestionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  await questionService.addQuestion(organization.id, quizId, parsed.data);
  revalidatePath(`/dashboard/quiz/${quizId}`);
  return { success: true };
}

export async function deleteQuestionAction(quizId: string, questionId: string) {
  await requireAuth();
  const organization = await requireActiveOrganization();
  await questionService.deleteQuestion(organization.id, quizId, questionId);
  revalidatePath(`/dashboard/quiz/${quizId}`);
}
