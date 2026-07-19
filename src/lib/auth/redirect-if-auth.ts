import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Redirect to /dashboard if the user is already authenticated. */
export async function redirectIfAuthenticated() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }
}
