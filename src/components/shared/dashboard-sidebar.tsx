"use client";

import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Settings } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { cn, initials } from "@/lib/utils";
import { PlanBadge } from "@/features/dashboard/components/plan-badge";

const STORAGE_KEY = "quiznest:sidebar-collapsed";

export function DashboardSidebar({ user, planName }: { user: { name: string; email: string }; planName: string | null }) {
  const router = useRouter();
  const { collapsed, toggle } = useSidebarCollapsed(STORAGE_KEY);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

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

      {/* Plan badge */}
      <div className={cn("shrink-0 space-y-2 border-t py-3", collapsed ? "flex flex-col items-center px-2" : "px-3")}>
        <PlanBadge planName={planName} collapsed={collapsed} />
      </div>

      {/* Footer */}
      <div className={cn("flex shrink-0 flex-col gap-2 border-t py-3", collapsed ? "items-center px-2" : "px-3")}>
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="default"
                    size="icon"
                    aria-label="Paramètres"
                    className="rounded-lg p-4.5"
                    onClick={() => router.push("/dashboard/settings")}
                  />
                }
              >
                <Settings className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Paramètres
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Avatar className="size-9 cursor-default">
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                {user.name}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Déconnexion"
                    className="rounded-lg p-4.5"
                    onClick={handleSignOut}
                  />
                }
              >
                <LogOut className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Déconnexion
              </TooltipContent>
            </Tooltip>

            <div className="h-px w-6 bg-border" />

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label="Déplier la navigation"
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  />
                }
              >
                <ChevronsRight className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Déplier
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-1">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start rounded-lg gap-2.5 p-4.5"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="size-4" />
              Paramètres
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start rounded-lg gap-2.5 p-4.5 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
