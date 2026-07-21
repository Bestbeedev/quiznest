"use client";

import Link from "next/link";
import { Coins } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletBadgeProps {
  balance: number;
  collapsed?: boolean;
}

export function WalletBadge({ balance, collapsed }: WalletBadgeProps) {
  const isLow = balance <= 5;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href="/dashboard/wallet"
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors",
                isLow
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-primary/10 text-primary hover:bg-primary/20",
              )}
              title={`${balance} crédit${balance !== 1 ? "s" : ""}`}
            />
          }
        >
          <Coins className="size-4" />
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {balance} crédit{balance !== 1 ? "s" : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href="/dashboard/wallet"
      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
    >
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-md",
          isLow ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        )}
      >
        <Coins className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-none">
          {balance} crédit{balance !== 1 ? "s" : ""}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Wallet</p>
      </div>
    </Link>
  );
}
