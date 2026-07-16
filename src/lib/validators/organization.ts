import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
