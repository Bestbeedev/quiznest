"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Coins, Crown, LogOut, Settings, Sparkles } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { cn, initials } from "@/lib/utils";
import { PlanBadge } from "@/features/dashboard/components/plan-badge";
import { WalletBadge } from "@/features/dashboard/components/wallet-badge";

const STORAGE_KEY = "quiznest:sidebar-collapsed";

export function DashboardSidebar({ user, planName, walletBalance }: { user: { name: string; email: string }; planName: string | null; walletBalance: number }) {
  const router = useRouter();
  const { collapsed, toggle } = useSidebarCollapsed(STORAGE_KEY);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="outline-none" />
        }
      >
        <Avatar className="size-8 cursor-pointer transition-opacity hover:opacity-80">
          <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        sideOffset={8}
        align={collapsed ? "start" : "center"}
        className="w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Settings className="size-4" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px] items-center" : "w-60",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Logo iconOnly={collapsed} href="/dashboard" />

        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Replier la navigation"
            className="rounded-lg p-1.5 text-muted-foreground mx-auto transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className={cn("flex flex-1 flex-col overflow-y-auto py-4", collapsed ? "items-center" : "px-3")}>
        <DashboardNav collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <WalletBadge balance={walletBalance} collapsed />
            <PlanBadge planName={planName} collapsed />
            <div className="h-px w-6 bg-border" />
            <Tooltip>
              <TooltipTrigger render={userMenu} />
              <TooltipContent side="right" sideOffset={8}>
                {user.name}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="py-3">
            {/* Wallet */}
            <Link
              href="/dashboard/billing"
              className={cn(
                "mx-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50",
                walletBalance <= 5
                  ? "text-destructive"
                  : "text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  walletBalance <= 5
                    ? "bg-destructive/10"
                    : "bg-primary/10",
                )}
              >
                <Coins className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-none">
                  {walletBalance} crédit{walletBalance !== 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Wallet</p>
              </div>
            </Link>

            <div className="mx-3 my-2 h-px bg-border" />

            {/* Profile with dropdown */}
            <div className="mx-3">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button type="button" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/50 outline-none" />
                  }
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-none">{user.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground leading-none">{user.email}</p>
                  </div>
                  <ChevronsRight className="size-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" sideOffset={8} align="start" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="size-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mx-3 my-2 h-px bg-border" />

            {/* Plan */}
            <Link
              href="/dashboard/billing"
              className={cn(
                "mx-3 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md",
                  (planName ?? "Free") === "Free"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {(planName ?? "Free") === "Free" ? <Sparkles className="size-3.5" /> : <Crown className="size-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-none">Plan {planName ?? "Free"}</p>
                {(planName ?? "Free") === "Free" && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Fonctionnalités limitées</p>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Expand/Collapse toggle */}
      <div className={cn("shrink-0 border-t py-3", collapsed ? "flex justify-center px-2" : "px-3")}>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={toggle}
                aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
            }
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </TooltipTrigger>
          <TooltipContent side={collapsed ? "right" : "top"} sideOffset={8}>
            {collapsed ? "Déplier" : "Replier"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
