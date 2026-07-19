"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { toast } from "sonner";

import { revokeOtherSessionsAction, revokeSessionAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type SessionRow = {
  id: string;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
  expiresAt: Date | string;
};

function parseDevice(userAgent: string | null | undefined) {
  if (!userAgent) return { label: "Appareil inconnu", Icon: Laptop };
  if (/mobile|android|iphone/i.test(userAgent)) return { label: "Mobile", Icon: Smartphone };
  if (/tablet|ipad/i.test(userAgent)) return { label: "Tablette", Icon: Tablet };
  return { label: "Ordinateur", Icon: Laptop };
}

function parseBrowser(userAgent: string | null | undefined) {
  if (!userAgent) return "Navigateur inconnu";
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/chrome\//i.test(userAgent)) return "Chrome";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/safari\//i.test(userAgent)) return "Safari";
  return "Navigateur";
}

export function SessionsList({
  sessions,
  currentSessionToken,
  unavailable,
}: {
  sessions: SessionRow[];
  currentSessionToken: string;
  /** true when better-auth refused to list sessions because this login is
   * more than 24h old (its "fresh session" requirement) — not an error to
   * hide, but not an empty list either. */
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (unavailable) {
    return (
      <Alert>
        <AlertDescription>
          Pour afficher la liste détaillée de vos sessions, reconnectez-vous — votre connexion
          actuelle date de plus de 24h.
        </AlertDescription>
      </Alert>
    );
  }

  const run = (action: () => Promise<void>, successMessage: string) => {
    startTransition(async () => {
      await action();
      router.refresh();
      toast.success(successMessage);
    });
  };

  const otherSessionsCount = sessions.filter((s) => s.token !== currentSessionToken).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const isCurrent = session.token === currentSessionToken;
          const { label, Icon } = parseDevice(session.userAgent);
          return (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {label} — {parseBrowser(session.userAgent)}
                    {isCurrent && <Badge variant="secondary">Session actuelle</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.ipAddress ?? "IP inconnue"} · Connecté le{" "}
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(session.createdAt),
                    )}
                  </p>
                </div>
              </div>
              {!isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => run(() => revokeSessionAction(session.token), "Session révoquée.")}
                >
                  Révoquer
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {otherSessionsCount > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            Déconnecter les {otherSessionsCount} autres session{otherSessionsCount !== 1 ? "s" : ""}
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Déconnecter les autres sessions ?"
            description="Tous vos autres appareils connectés seront déconnectés."
            confirmLabel="Déconnecter"
            loading={isPending}
            onConfirm={() =>
              run(async () => {
                await revokeOtherSessionsAction();
                setConfirmOpen(false);
              }, "Autres sessions déconnectées.")
            }
          />
        </>
      )}
    </div>
  );
}
