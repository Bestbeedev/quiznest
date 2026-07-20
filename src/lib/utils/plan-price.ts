/**
 * Computes the effective price for a plan, accounting for active promotions.
 * Safe to use in both server and client components.
 */
export function effectivePlanPrice(plan: { price: number | null; promoPrice: number | null; promoEndsAt: Date | null }) {
  if (plan.promoPrice != null && (!plan.promoEndsAt || plan.promoEndsAt > new Date())) {
    return plan.promoPrice;
  }
  return plan.price;
}
