import { z } from "zod";

export const creditPackSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.coerce.number().int().min(1),
  currency: z.string().min(1).max(10).default("XOF"),
  credits: z.coerce.number().int().min(1),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export type CreditPackInput = z.infer<typeof creditPackSchema>;
