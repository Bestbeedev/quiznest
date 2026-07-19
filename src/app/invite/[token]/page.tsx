import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { getInvitationByToken } from "@/lib/services/invitation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/constants/roles";
import { AcceptInvitationButton } from "@/features/settings/components/accept-invitation-button";
import { buildMetadata } from "@/constants/seo";

export const metadata: Metadata = buildMetadata({
  title: "Invitation d'équipe",
  description:
    "Vous avez été invité à rejoindre une équipe sur QuizNest. Acceptez l'invitation pour accéder à l'espace partagé.",
  path: "/invite",
  noindex: true,
});

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);
  const session = await auth.api.getSession({ headers: await headers() });

  const callbackUrl = `/invite/${token}`;

  if (!invitation) {
    return (
      <InviteShell>
        <CardTitle>Invitation introuvable</CardTitle>
        <CardDescription>Ce lien d&apos;invitation n&apos;existe pas ou a été supprimé.</CardDescription>
      </InviteShell>
    );
  }

  if (invitation.status === "ACCEPTED") {
    return (
      <InviteShell>
        <CardTitle>Invitation déjà utilisée</CardTitle>
        <CardDescription>Cette invitation a déjà été acceptée.</CardDescription>
        <Link href="/dashboard" className={cn(buttonVariants(), "mt-4")}>
          Aller au tableau de bord
        </Link>
      </InviteShell>
    );
  }

  if (invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
    return (
      <InviteShell>
        <CardTitle>Invitation expirée</CardTitle>
        <CardDescription>
          Ce lien d&apos;invitation n&apos;est plus valide. Demandez à l&apos;administrateur de vous en
          envoyer un nouveau.
        </CardDescription>
      </InviteShell>
    );
  }

  if (!session) {
    return (
      <InviteShell>
        <CardTitle>Rejoindre {invitation.organization.name}</CardTitle>
        <CardDescription>
          Vous avez été invité en tant que <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>.
          Connectez-vous ou créez un compte avec l&apos;adresse <strong>{invitation.email}</strong> pour
          rejoindre.
        </CardDescription>
        <div className="mt-4 flex gap-2">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Se connecter
          </Link>
          <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className={cn(buttonVariants())}>
            Créer un compte
          </Link>
        </div>
      </InviteShell>
    );
  }

  if (session.user.email !== invitation.email) {
    return (
      <InviteShell>
        <CardTitle>Adresse email différente</CardTitle>
        <CardDescription>
          Cette invitation est destinée à <strong>{invitation.email}</strong>, mais vous êtes connecté avec{" "}
          <strong>{session.user.email}</strong>. Déconnectez-vous et reconnectez-vous avec la bonne adresse.
        </CardDescription>
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <CardTitle>Rejoindre {invitation.organization.name}</CardTitle>
      <CardDescription>
        Vous avez été invité en tant que <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>.
      </CardDescription>
      <AcceptInvitationButton token={token} />
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-2">{children}</CardHeader>
      </Card>
    </div>
  );
}
