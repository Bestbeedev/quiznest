"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Plus, Settings } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { GlobalSearch } from "@/features/dashboard/components/global-search";
import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";
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
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <div className="flex flex-col gap-6 p-4">
            <SheetTitle className="px-3">
              <Logo />
            </SheetTitle>
            <DashboardNav onNavigate={() => setMobileNavOpen(false)} />
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
                router.push("/dashboard/settings");
              }}
            >
              <Settings className="size-4" />
              Paramètres
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

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Ouvrir la navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="max-w-md flex-1">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <NewQuizDialog>
          <Button size="icon" className="rounded-full" aria-label="Nouveau quiz" title="Nouveau quiz">
            <Plus className="size-4" />
          </Button>
        </NewQuizDialog>
      </div>
    </header>
  );
}
