const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/admin"];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
