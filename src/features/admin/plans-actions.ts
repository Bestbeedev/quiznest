"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { planSchema } from "@/lib/validators/plan";
import * as planService from "@/lib/services/plan";
import { ValidationError } from "@/lib/errors";

function revalidatePlanSurfaces() {
  revalidatePath("/admin/plans");
  revalidatePath("/dashboard/billing");
  revalidatePath("/");
}

export async function createPlanAction(input: unknown) {
  await requireSuperAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await planService.createPlan(parsed.data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePlanSurfaces();
  return { success: true as const };
}

export async function updatePlanAction(planId: string, input: unknown) {
  await requireSuperAdmin();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  }

  try {
    await planService.updatePlan(planId, parsed.data);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePlanSurfaces();
  return { success: true as const };
}

export async function deletePlanAction(planId: string) {
  await requireSuperAdmin();

  try {
    await planService.deletePlan(planId);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePlanSurfaces();
  return { success: true as const };
}

export async function setPlanActiveAction(planId: string, isActive: boolean) {
  await requireSuperAdmin();
  await planService.setPlanActive(planId, isActive);
  revalidatePlanSurfaces();
  return { success: true as const };
}
