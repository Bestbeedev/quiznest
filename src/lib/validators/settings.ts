import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(30).optional().or(z.literal("")),
  image: z.url().max(500).optional().or(z.literal("")),
  timezone: z.string().min(1).max(100),
  language: z.enum(["fr", "en"]),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type PasswordInput = z.infer<typeof passwordSchema>;

export const notificationPreferencesSchema = z.object({
  quizResults: z.boolean(),
  weeklyDigest: z.boolean(),
  teamActivity: z.boolean(),
});
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement"),
  logo: z.url().max(500).optional().or(z.literal("")),
  timezone: z.string().min(1).max(100),
  language: z.enum(["fr", "en"]),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hexadécimale invalide")
    .optional()
    .or(z.literal("")),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "MANAGER", "EDITOR", "VIEWER"]),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
