"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { toast } from "sonner";

import { changeMemberRoleAction, removeMemberAction } from "@/features/settings/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getInitials } from "@/lib/utils/member";
import { ROLE_LABELS, type MemberRole } from "@/constants/roles";

const ASSIGNABLE_ROLES: MemberRole[] = ["OWNER", "ADMIN", "MANAGER", "EDITOR", "VIEWER"];

type Member = {
  id: string;
  userId: string;
  role: MemberRole;
  user: { name: string; email: string; image: string | null };
};

export function TeamMembersList({
  members,
  currentUserId,
  canManage,
}: {
  members: Member[];
  currentUserId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<void>) => {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  };

  const handleRoleChange = (memberId: string, role: string) => {
    setError(null);
    run(async () => {
      const result = await changeMemberRoleAction(memberId, role);
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Rôle mis à jour.");
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar>
              {member.user.image && <AvatarImage src={member.user.image} alt={member.user.name} />}
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{member.user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {canManage ? (
              <Select
                value={member.role}
                onValueChange={(role) => role && handleRoleChange(member.id, role)}
                items={ROLE_LABELS}
              >
                <SelectTrigger size="sm" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-muted-foreground">{ROLE_LABELS[member.role]}</span>
            )}

            {canManage && member.userId !== currentUserId && (
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => setRemovingId(member.id)}
                aria-label="Retirer ce membre"
              >
                <UserX className="size-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={removingId !== null}
        onOpenChange={(open) => !open && setRemovingId(null)}
        title="Retirer ce membre ?"
        description="Cette personne perdra immédiatement l'accès à l'organisation."
        confirmLabel="Retirer"
        loading={isPending}
        onConfirm={() => {
          if (!removingId) return;
          run(async () => {
            const result = await removeMemberAction(removingId);
            setRemovingId(null);
            if (result?.error) {
              toast.error(result.error);
              return;
            }
            toast.success("Membre retiré.");
          });
        }}
      />
    </div>
  );
}
