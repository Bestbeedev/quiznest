"use client";

import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Settings, User } from "lucide-react";

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
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronsLeft className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className={cn("flex flex-1 flex-col overflow-y-auto py-4", collapsed ? "items-center" : "px-3")}>
        <DashboardNav collapsed={collapsed} />
      </div>

      {/* Wallet + Plan + User menu */}
      <div className={cn("shrink-0 space-y-2 border-t py-3", collapsed ? "flex flex-col items-center px-2" : "px-3")}>
        <WalletBadge balance={walletBalance} collapsed={collapsed} />
        <PlanBadge planName={planName} collapsed={collapsed} />

        <div className="flex items-center justify-center pt-1">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger render={userMenu} />
              <TooltipContent side="right" sideOffset={8}>
                {user.name}
              </TooltipContent>
            </Tooltip>
          ) : (
            userMenu
          )}
        </div>
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
