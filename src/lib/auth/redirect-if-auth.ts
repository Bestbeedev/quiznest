import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Redirect away if the user is already authenticated. Respects a `callbackUrl`
 *  search param so plan-selection flows (landing → /register?callbackUrl=…)
 *  land on the right page instead of always going to /dashboard. */
export async function redirectIfAuthenticated(callbackUrl?: string | null) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect(callbackUrl ?? "/dashboard");
  }
}
