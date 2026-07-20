"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { couponSchema } from "@/lib/validators/coupon";
import { creditPackSchema } from "@/lib/validators/credit-pack";
import { addOnProductSchema } from "@/lib/validators/addon-product";
import { passSchema } from "@/lib/validators/pass";
import * as couponService from "@/lib/services/coupon";
import * as walletService from "@/lib/services/wallet";
import * as addonService from "@/lib/services/addon";
import * as passService from "@/lib/services/pass";
import { ValidationError } from "@/lib/errors";

function revalidateCommerce() {
  revalidatePath("/admin/coupons");
  revalidatePath("/admin/wallet");
  revalidatePath("/admin/addons");
  revalidatePath("/admin/passes");
  revalidatePath("/dashboard/billing");
}

function wrap<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => ({ success: true as const, data }),
    (error) => {
      if (error instanceof ValidationError) return { error: error.message };
      throw error;
    },
  );
}

// --- Coupons ---

export async function createCouponAction(input: unknown) {
  await requireSuperAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => couponService.createCoupon(parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function updateCouponAction(id: string, input: unknown) {
  await requireSuperAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => couponService.updateCoupon(id, parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function deleteCouponAction(id: string) {
  await requireSuperAdmin();
  const result = await wrap(() => couponService.deleteCoupon(id));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

// --- Credit packs ---

export async function createCreditPackAction(input: unknown) {
  await requireSuperAdmin();
  const parsed = creditPackSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => walletService.createCreditPack(parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function updateCreditPackAction(id: string, input: unknown) {
  await requireSuperAdmin();
  const parsed = creditPackSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => walletService.updateCreditPack(id, parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function deleteCreditPackAction(id: string) {
  await requireSuperAdmin();
  const result = await wrap(() => walletService.deleteCreditPack(id));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function setCreditPackActiveAction(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await walletService.setCreditPackActive(id, isActive);
  revalidateCommerce();
  return { success: true as const };
}

// --- Add-on products ---

export async function createAddOnProductAction(input: unknown) {
  await requireSuperAdmin();
  const parsed = addOnProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => addonService.createAddOnProduct(parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function updateAddOnProductAction(id: string, input: unknown) {
  await requireSuperAdmin();
  const parsed = addOnProductSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => addonService.updateAddOnProduct(id, parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function deleteAddOnProductAction(id: string) {
  await requireSuperAdmin();
  const result = await wrap(() => addonService.deleteAddOnProduct(id));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function setAddOnProductActiveAction(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await addonService.setAddOnProductActive(id, isActive);
  revalidateCommerce();
  return { success: true as const };
}

// --- Passes ---

export async function createPassAction(input: unknown) {
  await requireSuperAdmin();
  const parsed = passSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => passService.createPass(parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function updatePassAction(id: string, input: unknown) {
  await requireSuperAdmin();
  const parsed = passSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Entrée invalide." };
  const result = await wrap(() => passService.updatePass(id, parsed.data));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function deletePassAction(id: string) {
  await requireSuperAdmin();
  const result = await wrap(() => passService.deletePass(id));
  if (!("error" in result)) revalidateCommerce();
  return result;
}

export async function setPassActiveAction(id: string, isActive: boolean) {
  await requireSuperAdmin();
  await passService.setPassActive(id, isActive);
  revalidateCommerce();
  return { success: true as const };
}
