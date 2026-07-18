"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { startAttemptSchema, submitAttemptSchema } from "@/lib/validators/participation";
import * as participationService from "@/lib/services/participation";
import { AppError } from "@/lib/errors";

export async function startAttemptAction(accessCode: string, input: unknown) {
  const quiz = await participationService.getPublicQuiz(accessCode);
  if (!quiz) {
    return { error: "Ce quiz n'est plus disponible." };
  }

  const parsed = startAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  const headerList = await headers();
  let participantId: string;

  try {
    const participant = await participationService.startAttempt(quiz, parsed.data, {
      ipAddress: headerList.get("x-forwarded-for"),
      userAgent: headerList.get("user-agent"),
    });
    participantId = participant.id;
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/q/${accessCode}/play?pid=${participantId}`);
}

export async function submitAttemptAction(accessCode: string, quizId: string, participantId: string, input: unknown) {
  const parsed = submitAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await participationService.submitAttempt(participantId, quizId, parsed.data);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect(`/q/${accessCode}/result?pid=${participantId}`);
}
