/**
 * Billing & Subscription Types
 */

import type { SubscriptionPlanId } from '@/lib/platform-pricing'

export type { SubscriptionPlanId }

/** Represents an organizer's subscription state (mock/localStorage-backed). */
export type OrganizerSubscription = {
  /** The current plan ID. */
  planId: SubscriptionPlanId
  /** ISO date when the subscription started. */
  startedAt: string
  /** ISO date when the subscription renews (null for free plan). */
  renewsAt: string | null
}

