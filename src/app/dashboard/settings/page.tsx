import type { Metadata } from "next";
import { headers } from "next/headers";

import { requireAuth } from "@/lib/auth/require-auth";
import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationMembers } from "@/lib/services/organization";
import { getNotificationPreferences, listUserSessions } from "@/lib/services/user";
import { listPendingInvitations } from "@/lib/services/invitation";
import { listApiKeys } from "@/lib/services/api-key";
import { prisma } from "@/lib/db/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { PasswordForm } from "@/features/settings/components/password-form";
import { SessionsList } from "@/features/settings/components/sessions-list";
import { OrganizationSettingsForm } from "@/features/settings/components/organization-settings-form";
import { TeamMembersList } from "@/features/settings/components/team-members-list";
import { InviteMemberDialog } from "@/features/settings/components/invite-member-dialog";
import { PendingInvitationsList } from "@/features/settings/components/pending-invitations-list";
import { ApiKeysManager } from "@/features/settings/components/api-keys-manager";
import { NotificationPreferencesForm } from "@/features/settings/components/notification-preferences-form";
import type { MemberRole } from "@/constants/roles";

export const metadata: Metadata = {
  title: "Paramètres — QuizNest",
};

export default async function SettingsPage() {
  const session = await requireAuth();
  const organization = await requireActiveOrganization();
  const headerList = await headers();

  const [user, members, preferences, sessionsResult, pendingInvitations, apiKeys] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    getOrganizationMembers(organization.id),
    getNotificationPreferences(session.user.id),
    listUserSessions(headerList),
    listPendingInvitations(organization.id),
    listApiKeys(organization.id),
  ]);

  const currentMember = members.find((m) => m.userId === session.user.id);
  const canManageTeam = currentMember?.role === "OWNER";
  const branding = (organization.settings as { branding?: { primaryColor?: string } } | null)?.branding;
  const sessionsList = sessionsResult ?? [];
  const sessionsUnavailable = sessionsResult === null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Centre de configuration de votre compte et de votre organisation.</p>
      </div>

      <SettingsNav
        profile={
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profil</CardTitle>
                <CardDescription>Vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={user} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mot de passe</CardTitle>
                <CardDescription>Changez votre mot de passe de connexion.</CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordForm />
              </CardContent>
            </Card>
          </div>
        }
        security={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sessions et appareils</CardTitle>
              <CardDescription>Les appareils actuellement connectés à votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsList
                sessions={sessionsList}
                currentSessionToken={session.session.token}
                unavailable={sessionsUnavailable}
              />
            </CardContent>
          </Card>
        }
        organization={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organisation</CardTitle>
              <CardDescription>Identité, branding et localisation de votre organisation.</CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm
                organization={{
                  name: organization.name,
                  slug: organization.slug,
                  logo: organization.logo,
                  timezone: organization.timezone,
                  language: organization.language,
                  primaryColor: branding?.primaryColor ?? null,
                }}
              />
            </CardContent>
          </Card>
        }
        team={
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Membres de l&apos;équipe</CardTitle>
                <CardDescription>
                  {members.length} membre{members.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <InviteMemberDialog />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TeamMembersList
                members={members.map((m) => ({ ...m, role: m.role as MemberRole }))}
                currentUserId={session.user.id}
                canManage={canManageTeam}
              />
              {pendingInvitations.length > 0 && (
                <>
                  <Separator />
                  <PendingInvitationsList
                    invitations={pendingInvitations.map((i) => ({ ...i, role: i.role as MemberRole }))}
                  />
                </>
              )}
            </CardContent>
          </Card>
        }
        api={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clés API</CardTitle>
              <CardDescription>Gérez les clés d&apos;accès de votre organisation.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysManager apiKeys={apiKeys} />
            </CardContent>
          </Card>
        }
        preferences={
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notifications</CardTitle>
              <CardDescription>Choisissez les notifications que vous souhaitez recevoir.</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm preferences={preferences} />
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
