"use client";

import { useState } from "react";
import { Bell, Building2, KeyRound, Shield, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { value: "profile", label: "Profil", icon: User, description: "Informations personnelles" },
  { value: "security", label: "Sécurité", icon: Shield, description: "Sessions et appareils" },
  { value: "organization", label: "Organisation", icon: Building2, description: "Identité et branding" },
  { value: "team", label: "Équipe", icon: Users, description: "Membres et invitations" },
  { value: "api", label: "API", icon: KeyRound, description: "Clés d'accès" },
  { value: "preferences", label: "Préférences", icon: Bell, description: "Notifications" },
] as const;

type SettingsTab = (typeof NAV_ITEMS)[number]["value"];

export function SettingsNav({
  children,
  defaultValue = "profile",
}: {
  children: Record<SettingsTab, React.ReactNode>;
  defaultValue?: SettingsTab;
}) {
  const [active, setActive] = useState<SettingsTab>(defaultValue);

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

      <div className="min-w-0 flex-1">{children[active]}</div>
    </div>
  );
}
