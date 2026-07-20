import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown in place of a gated action when the org's plan doesn't include it —
 * never just hide the control, always explain why and offer a way forward
 * (Prompt-Archi.md "RESTRICTIONS": explication claire, jamais frustrante). */
export function FeatureLockNotice({ label, reason }: { label: string; reason?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Button type="button" variant="outline" disabled className="gap-1.5 text-muted-foreground" title={reason}>
        <Lock className="size-3.5" />
        {label}
      </Button>
      <Link
        href="/dashboard/billing"
        className="text-xs font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Voir les plans
      </Link>
    </div>
  );
}
