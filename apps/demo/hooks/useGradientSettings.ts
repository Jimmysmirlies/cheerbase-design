"use client";

import { useState, useEffect, useCallback } from "react";
import type { BrandGradient } from "@/lib/gradients";

type GradientSettingsOptions = {
  /** Storage key prefix (e.g., 'cheerbase-organizer-settings' or 'cheerbase-club-settings') */
  storageKeyPrefix: string;
  /** Entity ID to append to storage key */
  entityId: string | undefined;
  /** Default gradient to use if none is stored */
  defaultGradient?: BrandGradient;
  /** Event name to listen for changes (e.g., 'organizer-settings-changed') */
  eventName: string;
};

/**
 * Hook for loading and listening to gradient settings from localStorage.
 * Used across organizer and club pages for consistent gradient handling.
 */
export function useGradientSettings({
  storageKeyPrefix,
  entityId,
  defaultGradient,
  eventName,
}: GradientSettingsOptions) {
  const [gradient, setGradient] = useState<BrandGradient | undefined>(
    defaultGradient,
  );

  useEffect(() => {
    const loadGradient = () => {
      if (!entityId) {
        setGradient(defaultGradient);
        return;
      }

      try {
        const stored = localStorage.getItem(`${storageKeyPrefix}-${entityId}`);
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.gradient) {
            setGradient(settings.gradient as BrandGradient);
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }
      setGradient(defaultGradient);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setGradient(event.detail.gradient as BrandGradient);
      }
    };

    window.addEventListener(eventName, handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener(
        eventName,
        handleSettingsChange as EventListener,
      );
    };
  }, [entityId, defaultGradient, storageKeyPrefix, eventName]);

  const updateGradient = useCallback(
    (newGradient: BrandGradient) => {
      if (!entityId) return;

      setGradient(newGradient);
      try {
        const storageKey = `${storageKeyPrefix}-${entityId}`;
        const existing = localStorage.getItem(storageKey);
        const settings = existing ? JSON.parse(existing) : {};
        settings.gradient = newGradient;
        localStorage.setItem(storageKey, JSON.stringify(settings));

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: { gradient: newGradient },
          }),
        );
      } catch {
        // Ignore storage errors
      }
    },
    [entityId, storageKeyPrefix, eventName],
  );

  return { gradient, setGradient: updateGradient };
}

/**
 * Convenience hook for organizer gradient settings.
 */
export function useOrganizerGradient(
  organizerId: string | undefined,
  defaultGradient?: BrandGradient,
) {
  return useGradientSettings({
    storageKeyPrefix: "cheerbase-organizer-settings",
    entityId: organizerId,
    defaultGradient,
    eventName: "organizer-settings-changed",
  });
}

/**
 * Convenience hook for club gradient settings.
 */
export function useClubGradient(
  clubId: string | undefined,
  defaultGradient?: BrandGradient,
) {
  return useGradientSettings({
    storageKeyPrefix: "cheerbase-club-settings",
    entityId: clubId,
    defaultGradient,
    eventName: "club-settings-changed",
  });
}
