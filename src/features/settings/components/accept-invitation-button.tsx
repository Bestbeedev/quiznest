"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { acceptInvitationAction } from "@/features/settings/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AcceptInvitationButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitationAction(token);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleAccept} disabled={isPending} className="w-fit gap-1.5">
        <CheckCircle2 className="size-4" />
        {isPending ? "Acceptation..." : "Accepter l'invitation"}
      </Button>
    </div>
  );
}
