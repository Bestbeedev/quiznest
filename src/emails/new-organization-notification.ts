import { emailLayout } from "@/emails/layout";

export function buildNewOrganizationNotificationEmail(input: {
  organizationName: string;
  organizationSlug: string;
  ownerEmail: string;
}) {
  const { organizationName, organizationSlug, ownerEmail } = input;

  return {
    subject: `Nouvelle organisation créée : ${organizationName}`,
    html: emailLayout(`
      <p>Une nouvelle organisation vient d'être créée sur QuizNest.</p>
      <ul style="padding-left:20px;">
        <li><strong>Nom :</strong> ${organizationName}</li>
        <li><strong>Slug :</strong> ${organizationSlug}</li>
        <li><strong>Créée par :</strong> ${ownerEmail}</li>
      </ul>
    `),
    text: `Nouvelle organisation créée sur QuizNest.\nNom: ${organizationName}\nSlug: ${organizationSlug}\nCréée par: ${ownerEmail}`,
  };
}
