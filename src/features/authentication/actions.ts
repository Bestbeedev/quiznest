"use server";

import { getDefaultRedirectPath } from "@/lib/auth/get-default-redirect";

/**
 * Returns the appropriate post-login redirect path.
 * Super admins → /admin, regular users → /dashboard.
 */
export async function getPostLoginRedirect(callbackUrl?: string | null): Promise<string> {
  if (callbackUrl) return callbackUrl;
  return getDefaultRedirectPath();
}
