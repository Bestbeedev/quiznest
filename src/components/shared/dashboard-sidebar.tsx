"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Settings } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlanBadge } from "@/features/dashboard/components/plan-badge";

const STORAGE_KEY = "quiznest:sidebar-collapsed";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

let collapsedListeners: Array<() => void> = [];

function subscribeCollapsed(callback: () => void) {
  collapsedListeners.push(callback);
  return () => {
    collapsedListeners = collapsedListeners.filter((listener) => listener !== callback);
  };
}

function getCollapsedSnapshot() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === null ? true : stored === "true";
}

function getCollapsedServerSnapshot() {
  return true;
}

function setCollapsedStore(value: boolean) {
  localStorage.setItem(STORAGE_KEY, String(value));
  collapsedListeners.forEach((listener) => listener());
}

export function DashboardSidebar({ user, planName }: { user: { name: string; email: string }; planName: string | null }) {
  const router = useRouter();
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);

  const toggle = () => setCollapsedStore(!collapsed);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[76px] items-center" : "w-60",
      )}
    >
      <div className={cn("flex items-center border-b py-3.5", collapsed ? "w-full flex-col gap-2" : "justify-between px-4")}>
        <Logo iconOnly={collapsed} href="/dashboard" />
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      <div className={cn("flex flex-1 flex-col overflow-y-auto py-4", collapsed ? "items-center" : "px-3")}>
        <DashboardNav collapsed={collapsed} />
      </div>

      <div className={cn("space-y-2 border-t pt-3", collapsed ? "flex flex-col items-center px-2" : "px-3")}>
        <PlanBadge planName={planName} collapsed={collapsed} />
      </div>

      <div className={cn("flex flex-col gap-2 border-t py-3", collapsed ? "items-center" : "px-3")}>
        {collapsed ? (
          <>
            <Button
              variant="default"
              size="icon"
              title="Paramètres"
              className="rounded-lg p-4.5"
              aria-label="Paramètres"
              onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="size-4" />
            </Button>
            <div className="h-px w-6 bg-border" />
            <Avatar className="size-9" title={user.name}>
              <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <Button variant="destructive" size="icon" title="Déconnexion" aria-label="Déconnexion" className="rounded-lg p-4.5" onClick={handleSignOut}>
              <LogOut className="size-4" />
            </Button>
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
