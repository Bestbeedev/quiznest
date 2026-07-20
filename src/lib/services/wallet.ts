import "server-only";
import { prisma } from "@/lib/db/client";
import { ValidationError } from "@/lib/errors";
import type { CreditPackInput } from "@/lib/validators/credit-pack";

export async function getOrCreateWallet(organizationId: string) {
  const existing = await prisma.wallet.findUnique({ where: { organizationId } });
  if (existing) return existing;
  return prisma.wallet.create({ data: { organizationId } });
}

export async function getWalletTransactions(organizationId: string, limit = 50) {
  const wallet = await getOrCreateWallet(organizationId);
  return prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function topUpWallet(organizationId: string, credits: number, reason: string, paymentId?: string) {
  const wallet = await getOrCreateWallet(organizationId);

  await prisma.$transaction([
    prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: credits } } }),
    prisma.walletTransaction.create({
      data: { walletId: wallet.id, type: "TOPUP", amount: credits, reason, paymentId },
    }),
  ]);
}

export async function spendCredits(organizationId: string, amount: number, reason: string) {
  const wallet = await getOrCreateWallet(organizationId);
  if (wallet.balance < amount) {
    throw new ValidationError("Solde insuffisant. Rechargez votre wallet pour continuer.");
  }

  await prisma.$transaction([
    prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } }),
    prisma.walletTransaction.create({ data: { walletId: wallet.id, type: "SPEND", amount, reason } }),
  ]);
}

export async function listCreditPacks() {
  return prisma.creditPack.findMany({ orderBy: { displayOrder: "asc" } });
}

export async function listActiveCreditPacks() {
  return prisma.creditPack.findMany({ where: { isActive: true }, orderBy: { displayOrder: "asc" } });
}

export async function getCreditPackById(id: string) {
  const pack = await prisma.creditPack.findUnique({ where: { id } });
  if (!pack) throw new ValidationError("Pack de crédits introuvable.");
  return pack;
}

export async function createCreditPack(input: CreditPackInput) {
  return prisma.creditPack.create({ data: input });
}

export async function updateCreditPack(id: string, input: CreditPackInput) {
  await getCreditPackById(id);
  return prisma.creditPack.update({ where: { id }, data: input });
}

export async function deleteCreditPack(id: string) {
  await prisma.creditPack.delete({ where: { id } });
}

export async function setCreditPackActive(id: string, isActive: boolean) {
  await getCreditPackById(id);
  return prisma.creditPack.update({ where: { id }, data: { isActive } });
}
