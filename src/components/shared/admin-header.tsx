"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  Settings,
  Bell,
} from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { ADMIN_NAV_GROUPS } from "@/constants/admin-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type SessionUser = { name: string; email: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      {/* Mobile nav sheet */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          {/* Mobile: header */}
          <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
            <a href="/admin" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-foreground text-background">
                <ShieldAlert className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">Admin</span>
                <span className="text-[10px] text-muted-foreground">QuizNest</span>
              </div>
            </a>
          </div>

          {/* Mobile: nav groups */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav groups={ADMIN_NAV_GROUPS} onNavigate={() => setMobileNavOpen(false)} />
          </div>

          {/* Mobile: footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2.5 px-1">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Separator className="my-2.5" />
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 px-2"
                onClick={() => {
                  setMobileNavOpen(false);
                  router.push("/admin/settings");
                }}
              >
                <Settings className="size-4" />
                Paramètres
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 px-2"
                onClick={() => {
                  setMobileNavOpen(false);
                  router.push("/dashboard");
                }}
              >
                <ArrowLeft className="size-4" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 px-2 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 md:hidden"
        aria-label="Ouvrir la navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Desktop: page context */}
      <div className="hidden items-center gap-2.5 md:flex">
        <Badge variant="secondary" className="gap-1.5 rounded-lg px-2 py-0.5 text-[11px]">
          <ShieldAlert className="size-3" />
          Super Admin
        </Badge>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Rechercher"
        >
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <ThemeToggle />

        <div className="mx-1 h-5 w-px bg-border" />

        {/* User dropdown-style button */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
          onClick={() => router.push("/admin/settings")}
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-xs font-medium leading-tight">{user.name}</span>
            <span className="text-[10px] text-muted-foreground">{user.email}</span>
          </div>
        </button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground"
          title="Retour au dashboard"
          aria-label="Retour au dashboard"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>
    </header>
  );
}
