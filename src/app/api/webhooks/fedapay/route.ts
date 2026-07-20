import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { paymentProvider } from "@/lib/payments/provider";
import { applyVerifiedPayment } from "@/lib/services/payment";
import type { Prisma } from "@/generated/prisma/client";

/** Public webhook endpoint — never trust the payload without provider
 * verification. `verifyWebhook` returns null (not an event) for anything it
 * can't cryptographically verify, in which case we log-and-ignore rather
 * than acting on it. Every event is still recorded for auditability even
 * when it can't be verified or applied. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-fedapay-signature");

  console.log("[webhook:fedapay] Received event", { hasSignature: !!signature, bodyLength: rawBody.length });

  const event = await paymentProvider.verifyWebhook(rawBody, signature);

  if (!event) {
    console.log("[webhook:fedapay] Unverified event — FEDAPAY_WEBHOOK_SECRET missing or signature invalid");
    await prisma.webhookEvent.create({
      data: {
        provider: "FEDAPAY",
        eventType: "unverified",
        payload: safeJsonParse(rawBody),
        processed: false,
        error: "Signature invalide ou FEDAPAY_WEBHOOK_SECRET non configurée.",
      },
    });
    return NextResponse.json({ received: true });
  }

  // Deduplication: skip if this exact event was already processed successfully
  const existingEvent = await prisma.webhookEvent.findFirst({
    where: {
      provider: "FEDAPAY",
      eventType: event.type,
      reference: event.providerReference,
      processed: true,
    },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      provider: "FEDAPAY",
      eventType: event.type,
      reference: event.providerReference,
      payload: safeJsonParse(rawBody),
      processed: false,
    },
  });

  try {
    const result = await applyVerifiedPayment(event);
    console.log("[webhook:fedapay] applyVerifiedPayment result", result, { status: event.status, type: event.type, ref: event.providerReference });
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processed: result.applied },
    });
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { error: error instanceof Error ? error.message : "Erreur inconnue" },
    });
  }

  return NextResponse.json({ received: true });
}

function safeJsonParse(raw: string): Prisma.InputJsonValue {
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    return { raw };
  }
}
