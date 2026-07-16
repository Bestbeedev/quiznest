"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { DashboardNav } from "@/components/shared/dashboard-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "quiznest:sidebar-collapsed";

export function DashboardSidebar({ organizationName }: { organizationName: string }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Deferred to an effect (not a lazy initializer) so the first client render matches
    // the server-rendered "expanded" markup — reading localStorage during render would
    // cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col gap-6 border-r p-4 transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center justify-between px-1">
        {!collapsed && (
          <span className="truncate text-base font-semibold tracking-tight">
            {organizationName}
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Déplier la navigation" : "Replier la navigation"}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>
      <DashboardNav collapsed={collapsed} />
    </aside>
  );
}
