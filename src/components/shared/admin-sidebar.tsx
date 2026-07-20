"use client";

import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, ShieldAlert } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { ADMIN_NAV_GROUPS } from "@/constants/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { cn, initials } from "@/lib/utils";

const STORAGE_KEY = "quiznest:admin-sidebar-collapsed";

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
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
        <a
          href="/admin"
          aria-label="Administration QuizNest"
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-xl bg-foreground text-background transition-transform hover:scale-105 active:scale-100",
            collapsed ? "size-10 justify-center" : "h-9 px-3",
          )}
        >
          <ShieldAlert className="size-4.5" />
          {!collapsed && <span className="text-sm font-bold tracking-tight">Admin</span>}
        </a>

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
        <SidebarNav groups={ADMIN_NAV_GROUPS} collapsed={collapsed} />
      </div>

      {/* Footer: User info + toggle */}
      <div
        className={cn(
          "flex shrink-0 flex-col gap-2 border-t py-3",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Avatar className="size-9 cursor-default">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {initials(user.name)}
                    </AvatarFallback>
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
                    variant="ghost"
                    size="icon"
                    aria-label="Déconnexion"
                    className="size-9 rounded-lg text-muted-foreground hover:text-destructive"
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
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium leading-tight">{user.name}</span>
                <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-2 px-2 text-xs text-muted-foreground"
                onClick={() => router.push("/dashboard")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </Button>
              <div className="h-4 w-px bg-border" />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                title="Déconnexion"
                aria-label="Déconnexion"
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
