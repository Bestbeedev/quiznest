"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Badge variant="secondary" className="gap-1.5">
            <ShieldAlert className="size-3.5" />
            Super admin
          </Badge>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Retour au dashboard
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
