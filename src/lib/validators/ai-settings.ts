import { z } from "zod";

// Business rule "apiKey is required unless one is already on file" depends on
// DB state (is this the first save, or an update that keeps the existing
// key?), so it's enforced in the service layer, not here — this schema only
// checks shape.
export const aiSettingsSchema = z
  .object({
    provider: z.enum(["PLATFORM", "OPENAI_COMPATIBLE", "ANTHROPIC"]),
    baseUrl: z.string().url().max(300).optional().or(z.literal("")),
    model: z.string().max(100).optional().or(z.literal("")),
    apiKey: z.string().min(10).max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.provider !== "OPENAI_COMPATIBLE" || data.baseUrl, {
    message: "L'URL de base de l'API est requise pour un fournisseur compatible OpenAI.",
    path: ["baseUrl"],
  });

export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
