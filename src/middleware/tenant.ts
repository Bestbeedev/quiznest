const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin"]);

/**
 * Extracts the tenant slug from the request host, e.g. `acme.quiznest.app` -> "acme".
 * Pure/edge-safe: no DB access here — actual org lookup happens in Server Components
 * (Node.js runtime), since Prisma's driver adapters can't run on the Edge middleware runtime.
 */
export function resolveTenantSlug(host: string | null, rootDomain: string): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0];
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) return null;
  if (!hostname.endsWith(`.${rootDomain}`)) return null;

  const subdomain = hostname.slice(0, -`.${rootDomain}`.length);
  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return null;

  return subdomain;
}
