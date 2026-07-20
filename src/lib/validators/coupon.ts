import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9-]+$/, "Majuscules, chiffres et tirets uniquement."),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().int().min(1),
  currency: z.string().max(10).optional().or(z.literal("")),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  maxRedemptions: z.coerce.number().int().min(1).nullable().optional(),
  isActive: z.boolean().default(true),
  planIds: z.array(z.string()).default([]),
});

export type CouponInput = z.infer<typeof couponSchema>;
