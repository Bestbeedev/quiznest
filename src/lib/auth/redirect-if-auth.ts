import "server-only";
import { redirect } from "next/navigation";
import { getDefaultRedirectPath } from "@/lib/auth/get-default-redirect";

/** Redirect away if the user is already authenticated. Super admins go to /admin, others to /dashboard.
 *  A `callbackUrl` search param takes precedence when provided. */
export async function redirectIfAuthenticated(callbackUrl?: string | null) {
  if (callbackUrl) {
    redirect(callbackUrl);
  }
  redirect(await getDefaultRedirectPath());
}
