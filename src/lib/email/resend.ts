import "server-only";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "QuizNest <onboarding@resend.dev>";

/** When RESEND_API_KEY isn't configured (local dev without an email provider),
 * emails are logged instead of sent so auth/notification flows stay testable
 * without a real provider — see the audit note on this in the project memory. */
export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY non configurée — email non envoyé, aperçu ci-dessous:\n` +
        `To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (error) {
    console.error("[email] Échec d'envoi Resend:", error);
    throw new Error("Impossible d'envoyer l'email.");
  }
}
