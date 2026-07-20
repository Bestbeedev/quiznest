export interface CheckoutCustomer {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateCheckoutInput {
  amount: number;
  currency: string;
  description: string;
  customer: CheckoutCustomer;
  callbackUrl: string;
  metadata: Record<string, string>;
}

export interface CreateCheckoutResult {
  providerReference: string;
  checkoutUrl: string;
}

export interface VerifiedWebhookEvent {
  type: string;
  providerReference: string;
  status: "approved" | "declined" | "canceled" | "pending" | string;
  amount: number | null;
  currency: string | null;
  metadata: Record<string, string>;
}

/**
 * Business code must depend only on this interface, never on a specific
 * provider's SDK — Prompt-Archi.md "PAIEMENTS": "Le code métier ne dépend
 * jamais directement de FedaPay." Swapping/adding Stripe, Kkiapay, MTN MoMo,
 * etc. means writing a new adapter of this shape, nothing else changes.
 */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  /** Returns null (not throws) when the event can't be verified — the
   * webhook route treats that as "ignore", never as "trust anyway". */
  verifyWebhook(rawBody: string, signature: string | null): Promise<VerifiedWebhookEvent | null>;
}
