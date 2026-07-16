"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Settings } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SessionUser = { name: string; email: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-4">
          <SheetTitle className="px-3 text-base font-semibold">QuizNest</SheetTitle>
          <DashboardNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Ouvrir la navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative hidden flex-1 max-w-sm sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="h-8 pl-8" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8">
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
