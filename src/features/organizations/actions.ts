"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { createOrganizationSchema } from "@/lib/validators/organization";
import { createOrganizationForUser } from "@/lib/services/organization";
import { ValidationError } from "@/lib/errors";

export async function createOrganizationAction(input: unknown) {
  const session = await requireAuth();
  const parsed = createOrganizationSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await createOrganizationForUser(session.user.id, parsed.data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  redirect("/dashboard");
}
