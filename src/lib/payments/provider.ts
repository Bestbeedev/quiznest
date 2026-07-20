import "server-only";
import { fedapayProvider } from "@/lib/payments/fedapay-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export type { PaymentProvider } from "@/lib/payments/types";

/** The only import business code should use — swapping/adding a provider
 * (Stripe, Kkiapay, MoMo, Wave, ...) means adding an adapter file next to
 * fedapay-provider.ts and switching this export, nothing else changes. */
export const paymentProvider: PaymentProvider = fedapayProvider;
