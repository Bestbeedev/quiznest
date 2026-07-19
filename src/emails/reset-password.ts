import { emailLayout } from "@/emails/layout";

export function buildResetPasswordEmail(input: { name: string; url: string }) {
  const { name, url } = input;

  return {
    subject: "Réinitialisez votre mot de passe QuizNest",
    html: emailLayout(`
      <p>Bonjour ${name},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe QuizNest. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien expire dans 1 heure.</p>
      <p style="margin:24px 0;">
        <a href="${url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;">Réinitialiser mon mot de passe</a>
      </p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email — votre mot de passe restera inchangé.</p>
    `),
    text: `Bonjour ${name},\n\nVous avez demandé la réinitialisation de votre mot de passe QuizNest. Ouvrez ce lien pour en choisir un nouveau (expire dans 1 heure) :\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
  };
}
