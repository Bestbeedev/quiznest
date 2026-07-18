"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function SidebarNav({
  items,
  onNavigate,
  collapsed = false,
}: {
  items: { label: string; href: string; icon: LucideIcon }[];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col", collapsed ? "gap-2" : "gap-0.5")}>
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "size-11 justify-center px-0",
              active
                ? collapsed
                  ? "bg-card text-primary shadow-sm"
                  : "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
