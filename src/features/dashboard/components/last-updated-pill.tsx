"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function LastUpdatedPill({ formattedDate }: { formattedDate: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      className="flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
    >
      <CalendarDays className="size-3.5" />
      {formattedDate}
      <RefreshCw className={cn("size-3.5", isPending && "animate-spin")} />
    </button>
  );
}
