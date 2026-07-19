"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Menu, Settings, ShieldAlert } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { SidebarNav } from "@/components/shared/sidebar-nav";
import { ADMIN_NAV } from "@/constants/admin-nav";
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
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <div className="flex flex-col gap-6 p-4">
            <SheetTitle className="px-3">
              <a href="/admin" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-2xl bg-foreground text-background">
                  <ShieldAlert className="size-4" />
                </div>
                <span className="text-lg font-bold tracking-tight">Admin</span>
              </a>
            </SheetTitle>
            <SidebarNav items={ADMIN_NAV} onNavigate={() => setMobileNavOpen(false)} />
          </div>
          <div className="mt-auto border-t p-4">
            <div className="flex items-center gap-2.5 px-1">
              <Avatar className="size-8">
                <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 px-1"
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
              className="w-full justify-start gap-2.5 px-1"
              onClick={() => {
                setMobileNavOpen(false);
                router.push("/dashboard");
              }}
            >
              <ArrowLeft className="size-4" />
              Retour au dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 px-1"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Déconnexion
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Ouvrir la navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Super admin badge */}
      <Badge variant="secondary" className="gap-1.5">
        <ShieldAlert className="size-3.5" />
        Super admin
      </Badge>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-1.5 sm:inline-flex"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="size-3.5" />
          Dashboard
        </Button>
      </div>
    </header>
  );
}
