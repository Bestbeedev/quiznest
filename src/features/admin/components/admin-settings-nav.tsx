"use client";

import { useState } from "react";
import { Bell, Database, Flag, Globe, Server } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { value: "system", label: "Système", icon: Server, description: "Statut, maintenance, santé" },
  { value: "plans", label: "Plans", icon: Globe, description: "Gestion des abonnements" },
  { value: "features", label: "Fonctionnalités", icon: Flag, description: "Feature flags" },
  { value: "notifications", label: "Notifications", icon: Bell, description: "Alertes administrateur" },
  { value: "database", label: "Base de données", icon: Database, description: "Status et santé" },
] as const;

type AdminSettingsTab = (typeof NAV_ITEMS)[number]["value"];

interface AdminSettingsNavProps {
  system: React.ReactNode;
  plans: React.ReactNode;
  features: React.ReactNode;
  notifications: React.ReactNode;
  database: React.ReactNode;
}

export function AdminSettingsNav({ system, plans, features, notifications, database }: AdminSettingsNavProps) {
  const [active, setActive] = useState<AdminSettingsTab>("system");

  const content: Record<AdminSettingsTab, React.ReactNode> = {
    system,
    plans,
    features,
    notifications,
    database,
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="shrink-0 lg:w-56">
        <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActive(item.value)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p className={cn("truncate", isActive && "text-primary")}>{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-w-0 flex-1">{content[active]}</div>
    </div>
  );
}
