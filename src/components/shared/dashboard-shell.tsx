import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type SessionUser = typeof auth.$Infer.Session.user;

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">QuizNest</span>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user.email}</span>
          <form
            action={async () => {
              "use server";
              await auth.api.signOut({ headers: await headers() });
              redirect("/");
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
