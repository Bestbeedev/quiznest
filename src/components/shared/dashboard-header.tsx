"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Plus, Settings, Coins, Crown, Sparkles } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { DashboardNav } from "@/components/shared/dashboard-nav";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { GlobalSearch } from "@/features/dashboard/components/global-search";
import { NewQuizDialog } from "@/features/quiz/components/new-quiz-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn, initials } from "@/lib/utils";

type SessionUser = { name: string; email: string };

export function DashboardHeader({ user, planName, walletBalance }: { user: SessionUser; planName: string | null; walletBalance: number }) {
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
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <div className="flex flex-col gap-6 p-4">
            <SheetTitle className="px-3">
              <Logo />
            </SheetTitle>
            <DashboardNav onNavigate={() => setMobileNavOpen(false)} />
          </div>

          <div className="mt-auto border-t">
            {/* Wallet */}
            <a
              href="/dashboard/billing"
              className={cn(
                "mx-4 mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50",
                walletBalance <= 5 ? "text-destructive" : "text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  walletBalance <= 5 ? "bg-destructive/10" : "bg-primary/10",
                )}
              >
                <Coins className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-none">
                  {walletBalance} crédit{walletBalance !== 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Wallet</p>
              </div>
            </a>

            <div className="mx-4 my-2 h-px bg-border" />

            {/* Profile */}
            <div className="mx-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-none">{user.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground leading-none">{user.email}</p>
              </div>
            </div>

            <div className="mx-4 my-2 h-px bg-border" />

            {/* Plan */}
            <a
              href="/dashboard/billing"
              className={cn(
                "mx-4 flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md",
                  (planName ?? "Free") === "Free"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {(planName ?? "Free") === "Free" ? <Sparkles className="size-3.5" /> : <Crown className="size-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-none">Plan {planName ?? "Free"}</p>
                {(planName ?? "Free") === "Free" && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Fonctionnalités limitées</p>
                )}
              </div>
            </a>

            <div className="mx-4 my-2 h-px bg-border" />

            {/* Actions */}
            <div className="mx-4 mb-3 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 flex-1 justify-start gap-2 text-xs text-muted-foreground"
                onClick={() => {
                  setMobileNavOpen(false);
                  router.push("/dashboard/settings");
                }}
              >
                <Settings className="size-3.5" />
                Paramètres
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start gap-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-3.5" />
                Déconnexion
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        aria-label="Ouvrir la navigation"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 lg:w-96">
        <GlobalSearch />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <NewQuizDialog>
          <Button size="icon" className=" sm:inline-flex rounded-full" aria-label="Nouveau quiz" title="Nouveau quiz">
            <Plus className="size-4" />
          </Button>
        </NewQuizDialog>
      </div>
    </header>
  );
}
