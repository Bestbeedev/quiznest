import "server-only";
import { FedaPay, Transaction, Webhook } from "fedapay";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProvider,
  VerifiedWebhookEvent,
} from "@/lib/payments/types";

/** The `fedapay` SDK types its resources as `{ [key: string]: any }` (they're
 * dynamic proxies over the API response) — this is the one place that `any`
 * boundary gets narrowed into a real shape before touching our domain code. */
type FedaPayTransactionShape = {
  id: number | string;
  status: string;
  amount: number;
  currency?: { iso?: string };
  custom_metadata?: Record<string, string> | null;
};

function configureFedaPay() {
  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error("FEDAPAY_SECRET_KEY n'est pas configurée — impossible d'initier un paiement.");
  }
  FedaPay.setApiKey(secretKey);
  FedaPay.setEnvironment(process.env.NEXT_PUBLIC_FEDAPAY_ENVIRONMENT === "live" ? "live" : "sandbox");
}

export const fedapayProvider: PaymentProvider = {
  name: "fedapay",

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    configureFedaPay();

    const fallbackName = input.customer.email.split("@")[0];
    const firstname = input.customer.firstName || fallbackName;
    const lastname = input.customer.lastName || fallbackName;

    const transaction = (await Transaction.create({
      description: input.description,
      amount: input.amount,
      currency: { iso: input.currency },
      callback_url: input.callbackUrl,
      custom_metadata: input.metadata,
      customer: { email: input.customer.email, firstname, lastname },
    })) as unknown as FedaPayTransactionShape;

    const tokenResponse = (await (transaction as unknown as { generateToken: () => Promise<{ url: string }> }).generateToken()) as { url: string };

    if (!tokenResponse?.url) {
      throw new Error("FedaPay n'a pas retourné d'URL de paiement.");
    }

    return {
      providerReference: String(transaction.id),
      checkoutUrl: tokenResponse.url,
    };
  },

  async verifyWebhook(rawBody: string, signature: string | null): Promise<VerifiedWebhookEvent | null> {
    const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
    if (!webhookSecret || !signature) {
      return null;
    }

    configureFedaPay();

    let event: { name?: string; type?: string; object_id?: number | string; entity?: { id?: number | string } };
    try {
      event = Webhook.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return null;
    }

    const transactionId = event.object_id ?? event.entity?.id;
    if (!transactionId) return null;

    let transaction: FedaPayTransactionShape;
    try {
      transaction = (await Transaction.retrieve(transactionId)) as unknown as FedaPayTransactionShape;
    } catch {
      return null;
    }

    return {
      type: event.name ?? event.type ?? "unknown",
      providerReference: String(transaction.id),
      status: transaction.status,
      amount: typeof transaction.amount === "number" ? transaction.amount : null,
      currency: transaction.currency?.iso ?? null,
      metadata: transaction.custom_metadata ?? {},
    };
  },
};
