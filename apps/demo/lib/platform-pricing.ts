/**
 * Platform Pricing Configuration
 *
 * Single source of truth for Cheerbase platform pricing:
 * - Platform take-rate (revenue model)
 * - Subscription plans and limits
 */

// ─────────────────────────────────────────────────────────────────────────────
// Platform Take Rate
// ─────────────────────────────────────────────────────────────────────────────

/** Platform fee as a decimal (3% = 0.03). Paid by the organizer (not shown on club invoices). */
export const PLATFORM_TAKE_RATE = 0.03;

/** Calculate the platform fee for a given invoice subtotal. */
export function calculatePlatformFee(subtotal: number): number {
  return Math.round(subtotal * PLATFORM_TAKE_RATE * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Plans
// ─────────────────────────────────────────────────────────────────────────────

export type SubscriptionPlanId = "free" | "pro";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  priceCents: number;
  priceLabel: string;
  billingPeriod: "year" | "month" | null;
  activeEventLimit: number;
  features: string[];
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> =
  {
    free: {
      id: "free",
      name: "Beginner",
      priceCents: 0,
      priceLabel: "$0",
      billingPeriod: null,
      activeEventLimit: 1,
      features: [
        "1 active event at a time",
        "Unlimited draft events",
        "3% platform fee on registrations",
      ],
    },
    pro: {
      id: "pro",
      name: "Organizer Pro",
      priceCents: 15000,
      priceLabel: "$150",
      billingPeriod: "year",
      activeEventLimit: 10,
      features: [
        "Up to 10 active events at a time",
        "Unlimited draft events",
        "3% platform fee on registrations",
        "Priority support",
      ],
    },
  };

/** Get a subscription plan by ID. Defaults to 'free' if not found. */
export function getPlan(planId: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId] ?? SUBSCRIPTION_PLANS.free;
}

/** Format a price in cents to a display string (e.g., 15000 → "$150"). */
export function formatPriceCents(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** Format a subscription plan's price with billing period (e.g., "$150/year"). */
export function formatPlanPrice(plan: SubscriptionPlan): string {
  if (plan.priceCents === 0) return "Free";
  const base = formatPriceCents(plan.priceCents);
  return plan.billingPeriod ? `${base}/${plan.billingPeriod}` : base;
}
