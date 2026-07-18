"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, ShieldAlert } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { ADMIN_NAV } from "@/constants/admin-nav";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "quiznest:admin-sidebar-collapsed";

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

export function AdminSidebar() {
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
        "hidden shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 md:flex",
        collapsed ? "w-[76px] items-center" : "w-60",
      )}
    >
      <div className={cn("flex items-center border-b py-3.5", collapsed ? "w-full flex-col gap-2" : "justify-between px-4")}>
        <Link
          href="/admin"
          aria-label="Administration QuizNest"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl bg-foreground text-background",
            collapsed ? "size-11 justify-center" : "px-3 py-2",
          )}
        >
          <ShieldAlert className="size-5" />
          {!collapsed && <span className="text-sm font-semibold tracking-tight">Admin</span>}
        </Link>
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
        <SidebarNav items={ADMIN_NAV} collapsed={collapsed} />
      </div>

      <div className={cn("flex flex-col gap-2 border-t py-3", collapsed ? "items-center" : "px-3")}>
        {collapsed ? (
          <button
            type="button"
            onClick={handleSignOut}
            title="Déconnexion"
            aria-label="Déconnexion"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
}
