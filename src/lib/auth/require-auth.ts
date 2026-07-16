import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}
