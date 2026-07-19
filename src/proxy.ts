import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { resolveTenantSlug } from "@/middleware/tenant";
import { isProtectedRoute } from "@/middleware/auth";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";

// Note: this must stay free of any Node.js-only imports (Prisma, bcrypt, etc.) —
// the proxy runs on the Edge Runtime. `getSessionCookie` only inspects the cookie,
// it does not hit the DB; the real session/user lookup happens in Server Components
// (see requireAuth in lib/auth/require-auth.ts).
export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const tenantSlug = resolveTenantSlug(req.headers.get("host"), ROOT_DOMAIN);

  if (isProtectedRoute(nextUrl.pathname) && !getSessionCookie(req)) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", nextUrl.pathname);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
