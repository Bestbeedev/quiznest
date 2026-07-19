"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";

import { revokeInvitationAction } from "@/features/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type MemberRole } from "@/constants/roles";

type Invitation = {
  id: string;
  email: string;
  role: MemberRole;
  token: string;
  createdAt: Date | string;
  inviter: { name: string };
};

export function PendingInvitationsList({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (invitations.length === 0) return null;

  const copyLink = (invitation: Invitation) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.token}`);
    setCopiedId(invitation.id);
    setTimeout(() => setCopiedId((current) => (current === invitation.id ? null : current)), 2000);
  };

  const revoke = (id: string) => {
    startTransition(async () => {
      await revokeInvitationAction(id);
      router.refresh();
      toast.success("Invitation révoquée.");
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Invitations en attente</p>
      {invitations.map((invitation) => (
        <div key={invitation.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{invitation.email}</p>
            <p className="text-xs text-muted-foreground">
              Invité par {invitation.inviter.name} ·{" "}
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(invitation.createdAt))}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline">{ROLE_LABELS[invitation.role]}</Badge>
            <Button variant="ghost" size="icon-sm" onClick={() => copyLink(invitation)} aria-label="Copier le lien">
              <Copy className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => revoke(invitation.id)}
              aria-label="Révoquer l'invitation"
            >
              <X className="size-4" />
            </Button>
          </div>
          {copiedId === invitation.id && <span className="sr-only">Lien copié</span>}
        </div>
      ))}
    </div>
  );
}
