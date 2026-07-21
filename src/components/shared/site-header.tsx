"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { NAV_LINKS } from "@/constants/marketing";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { useSession, signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {initials}
    </span>
  );
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  const isLoggedIn = !!session;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-xs"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5 text-[13px]",
                )}
              >
                <LayoutDashboard className="size-3.5" />
                Dashboard
              </Link>
              <div className="flex items-center gap-1.5">
                <UserAvatar name={session.user.name} />
                <button
                  type="button"
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.reload() } })}
                  className="flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-[13px]")}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "group gap-1 text-[13px] transition-all hover:scale-105 active:scale-100",
                )}
              >
                Essayer gratuitement
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="p-1.5"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="my-1 h-px bg-border" />
              {isLoggedIn ? (
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/dashboard"
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "gap-1.5 text-[13px]",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5 text-[13px]",
                    )}
                  >
                    <LogOut className="size-3.5" />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/login"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-[13px]")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className={cn(buttonVariants({ size: "sm" }), "group gap-1 text-[13px]")}
                    onClick={() => setMobileOpen(false)}
                  >
                    Essayer gratuitement
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
