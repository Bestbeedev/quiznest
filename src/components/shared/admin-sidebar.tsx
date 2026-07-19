"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Settings, ShieldAlert } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { ADMIN_NAV } from "@/constants/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "quiznest:admin-sidebar-collapsed";

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

export function AdminSidebar({ user }: { user: { name: string; email: string } }) {
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
      {/* Header: Logo + collapse */}
      <div className={cn("flex items-center border-b py-3.5", collapsed ? "w-full flex-col gap-2" : "justify-between px-4")}>
        <a
          href="/admin"
          aria-label="Administration QuizNest"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl bg-foreground text-background",
            collapsed ? "size-11 justify-center" : "px-3 py-2",
          )}
        >
          <ShieldAlert className="size-5" />
          {!collapsed && <span className="text-sm font-semibold tracking-tight">Admin</span>}
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
        </button>
      </div>

      {/* Nav */}
      <div className={cn("flex flex-1 flex-col overflow-y-auto py-4", collapsed ? "items-center" : "px-3")}>
        <SidebarNav items={ADMIN_NAV} collapsed={collapsed} />
      </div>

      {/* Super Admin badge */}
      <div className={cn("space-y-2 border-t py-3", collapsed ? "flex flex-col items-center px-2" : "px-3")}>
        <Badge variant="secondary" className={cn("gap-1.5", collapsed ? "size-9 justify-center px-0" : "")}>
          <ShieldAlert className="size-3.5" />
          {!collapsed && "Super Admin"}
        </Badge>
      </div>

      {/* Footer: User + Settings + Sign out */}
      <div className={cn("flex flex-col gap-2 border-t py-3", collapsed ? "items-center" : "px-3")}>
        {collapsed ? (
          <>
            <Avatar className="size-9" title={user.name}>
              <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <Button
              variant="default"
              size="icon"
              title="Paramètres"
              className="rounded-lg p-4.5"
              aria-label="Paramètres"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="size-4" />
            </Button>
            <div className="h-px w-6 bg-border" />
            <Button
              variant="destructive"
              size="icon"
              title="Déconnexion"
              aria-label="Déconnexion"
              className="rounded-lg p-4.5"
              onClick={handleSignOut}
            >
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
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="size-4" />
              Paramètres
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 px-1 text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/dashboard")}
            >
              Retour au dashboard
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
