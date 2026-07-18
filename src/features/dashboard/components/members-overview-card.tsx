import Link from "next/link";
import { Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { getInitials } from "@/lib/utils/member";
import { ROLE_LABELS, type MemberRole } from "@/constants/roles";

type Member = {
  id: string;
  role: MemberRole;
  user: { name: string; email: string; image: string | null };
};

const VISIBLE_COUNT = 5;

export function MembersOverviewCard({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <EmptyStateCard
        icon={Users}
        title="Membres de l'équipe"
        description="Invitez des collègues pour collaborer sur vos quiz."
      />
    );
  }

  const visible = members.slice(0, VISIBLE_COUNT);
  const overflow = members.length - visible.length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Équipe</CardTitle>
        <Badge variant="secondary">
          {members.length} membre{members.length !== 1 ? "s" : ""}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AvatarGroup>
          {visible.map((member) => (
            <Avatar key={member.id}>
              {member.user.image && <AvatarImage src={member.user.image} alt={member.user.name} />}
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
          ))}
          {overflow > 0 && (
            <AvatarGroupCount>
              <span className="text-xs">+{overflow}</span>
            </AvatarGroupCount>
          )}
        </AvatarGroup>

        <ul className="flex flex-col gap-2">
          {visible.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium">{member.user.name}</span>
              <Badge variant="outline" className="shrink-0">
                {ROLE_LABELS[member.role]}
              </Badge>
            </li>
          ))}
        </ul>

        <Link
          href="/dashboard/settings"
          className="text-sm text-primary underline underline-offset-4"
        >
          Gérer l&apos;équipe
        </Link>
      </CardContent>
    </Card>
  );
}
