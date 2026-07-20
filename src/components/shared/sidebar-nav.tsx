"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavGroup, NavItem } from "@/constants/admin-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function NavItemLink({
  item,
  onNavigate,
  collapsed,
  active,
}: {
  item: NavItem;
  onNavigate?: () => void;
  collapsed: boolean;
  active: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
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

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function SidebarNav({
  items,
  groups,
  onNavigate,
  collapsed = false,
}: {
  items?: NavItem[];
  groups?: NavGroup[];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  if (groups) {
    return (
      <nav className={cn("flex flex-col", collapsed ? "gap-4" : "gap-5")}>
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className={cn("flex flex-col", collapsed ? "gap-2" : "gap-0.5")}>
              {group.items.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  onNavigate={onNavigate}
                  collapsed={collapsed}
                  active={isActive(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className={cn("flex flex-col", collapsed ? "gap-2" : "gap-0.5")}>
      {(items ?? []).map((item) => (
        <NavItemLink
          key={item.href}
          item={item}
          onNavigate={onNavigate}
          collapsed={collapsed}
          active={isActive(item)}
        />
      ))}
    </nav>
  );
}
