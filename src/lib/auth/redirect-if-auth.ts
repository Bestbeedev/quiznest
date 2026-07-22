import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDefaultRedirectPath } from "@/lib/auth/get-default-redirect";

/** Redirect away if the user is already authenticated. Super admins go to /admin, others to /dashboard.
 *  A `callbackUrl` search param takes precedence when provided. */
export async function redirectIfAuthenticated(callbackUrl?: string | null) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;

  if (callbackUrl) {
    redirect(callbackUrl);
  }
  redirect(await getDefaultRedirectPath());
}
