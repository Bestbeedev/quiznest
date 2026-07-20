import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { dash } from "@better-auth/infra";
import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/resend";
import { buildResetPasswordEmail } from "@/emails/reset-password";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      const { subject, html, text } = buildResetPasswordEmail({ name: user.name, url });
      await sendEmail({ to: user.email, subject, html, text });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.loca.lt",
    "https://*.ngrok-free.app",
  ],
  plugins: [
    dash(),
    // Must stay last: syncs Set-Cookie headers from auth.api.* calls into
    // next/headers cookies() when invoked from Server Actions.
    nextCookies(),
  ],
});
