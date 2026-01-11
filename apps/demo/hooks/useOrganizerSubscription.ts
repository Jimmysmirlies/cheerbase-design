"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOrganizer } from "@/hooks/useOrganizer";
import {
  getPlan,
  type SubscriptionPlan,
  type SubscriptionPlanId,
} from "@/lib/platform-pricing";
import type { OrganizerSubscription } from "@/types/billing";

const SUBSCRIPTION_STORAGE_KEY = "cheerbase-organizer-subscription";

/** Demo organizer IDs that should default to Pro subscription. */
const DEMO_PRO_ORGANIZER_IDS = ["sapphire-productions"];

function getStorageKey(organizerId: string) {
  return `${SUBSCRIPTION_STORAGE_KEY}-${organizerId}`;
}

function loadSubscription(organizerId: string): OrganizerSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(getStorageKey(organizerId));
    if (stored) {
      return JSON.parse(stored) as OrganizerSubscription;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveSubscription(
  organizerId: string,
  subscription: OrganizerSubscription,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    getStorageKey(organizerId),
    JSON.stringify(subscription),
  );
}

function createDefaultSubscription(): OrganizerSubscription {
  return {
    planId: "free",
    startedAt: new Date().toISOString(),
    renewsAt: null,
  };
}

function createProSubscription(): OrganizerSubscription {
  const now = new Date();
  const renewsAt = new Date(now);
  renewsAt.setFullYear(renewsAt.getFullYear() + 1);

  return {
    planId: "pro",
    startedAt: now.toISOString(),
    renewsAt: renewsAt.toISOString(),
  };
}

export type UseOrganizerSubscriptionResult = {
  /** The current subscription state. */
  subscription: OrganizerSubscription;
  /** The full plan object for the current subscription. */
  plan: SubscriptionPlan;
  /** Whether the subscription data is still loading. */
  isLoading: boolean;
  /** Upgrade to the Pro plan (mock). */
  upgradeToPro: () => void;
  /** Downgrade to the Free plan (mock). */
  downgradeToFree: () => void;
  /** Check if the organizer can create/publish another active event. */
  canAddActiveEvent: (currentActiveCount: number) => boolean;
};

/**
 * Hook to manage an organizer's subscription state (localStorage-backed mock).
 */
export function useOrganizerSubscription(): UseOrganizerSubscriptionResult {
  const { organizerId, isLoading: organizerLoading } = useOrganizer();
  const [subscription, setSubscription] = useState<OrganizerSubscription>(
    createDefaultSubscription,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load subscription from localStorage when organizerId is available
  useEffect(() => {
    if (organizerLoading) return;
    if (!organizerId) {
      setIsLoading(false);
      return;
    }

    const stored = loadSubscription(organizerId);
    if (stored) {
      setSubscription(stored);
    } else {
      // Initialize demo organizers with Pro, others with Free
      const isDemo = DEMO_PRO_ORGANIZER_IDS.includes(organizerId);
      const defaultSub = isDemo
        ? createProSubscription()
        : createDefaultSubscription();
      saveSubscription(organizerId, defaultSub);
      setSubscription(defaultSub);
    }
    setIsLoading(false);
  }, [organizerId, organizerLoading]);

  const plan = useMemo(
    () => getPlan(subscription.planId),
    [subscription.planId],
  );

  const upgradeToPro = useCallback(() => {
    if (!organizerId) return;
    const proSub = createProSubscription();
    saveSubscription(organizerId, proSub);
    setSubscription(proSub);
  }, [organizerId]);

  const downgradeToFree = useCallback(() => {
    if (!organizerId) return;
    const freeSub = createDefaultSubscription();
    saveSubscription(organizerId, freeSub);
    setSubscription(freeSub);
  }, [organizerId]);

  const canAddActiveEvent = useCallback(
    (currentActiveCount: number) => currentActiveCount < plan.activeEventLimit,
    [plan.activeEventLimit],
  );

  return {
    subscription,
    plan,
    isLoading: isLoading || organizerLoading,
    upgradeToPro,
    downgradeToFree,
    canAddActiveEvent,
  };
}
