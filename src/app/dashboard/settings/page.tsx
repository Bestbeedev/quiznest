import type { Metadata } from "next";
import { UserPlus } from "lucide-react";

import { requireActiveOrganization } from "@/lib/db/tenant";
import { getOrganizationMembers } from "@/lib/services/organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import type { MemberRole } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "Paramètres — QuizNest",
};

const ROLE_LABELS: Record<MemberRole, string> = {
  SUPER_ADMIN: "Super admin",
  OWNER: "Propriétaire",
  ADMIN: "Admin",
  MANAGER: "Manager",
  EDITOR: "Éditeur",
  VIEWER: "Lecteur",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function SettingsPage() {
  const organization = await requireActiveOrganization();
  const members = await getOrganizationMembers(organization.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Gérez votre organisation et ses membres.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Général</CardTitle>
          <CardDescription>Informations de votre organisation.</CardDescription>
        </CardHeader>
        <CardContent className="flex max-w-md flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="org-name">Nom</FieldLabel>
            <Input id="org-name" defaultValue={organization.name} disabled />
          </Field>
          <Field>
            <FieldLabel htmlFor="org-slug">Identifiant</FieldLabel>
            <Input id="org-slug" defaultValue={organization.slug} disabled />
            <FieldDescription>La modification de l&apos;identifiant sera bientôt disponible.</FieldDescription>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Membres</CardTitle>
            <CardDescription>
              {members.length} membre{members.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button size="sm" disabled className="gap-1.5">
            <UserPlus className="size-4" />
            Inviter
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{member.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            L&apos;invitation par email nécessite la configuration de l&apos;envoi d&apos;emails — bientôt disponible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
