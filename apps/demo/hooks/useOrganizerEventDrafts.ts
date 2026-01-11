"use client";

import { useCallback, useMemo } from "react";
import type { Event } from "@/types/events";

const STORAGE_KEY_PREFIX = "cheerbase-organizer-events-drafts";

function getStorageKey(organizerId: string): string {
  return `${STORAGE_KEY_PREFIX}-${organizerId}`;
}

export function useOrganizerEventDrafts(organizerId: string | undefined) {
  const storageKey = useMemo(
    () => (organizerId ? getStorageKey(organizerId) : null),
    [organizerId],
  );

  const getDrafts = useCallback((): Event[] => {
    if (!storageKey || typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as Event[];
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  }, [storageKey]);

  const saveDraft = useCallback(
    (event: Event) => {
      if (!storageKey || typeof window === "undefined") return;

      const drafts = getDrafts();
      const existingIndex = drafts.findIndex((e) => e.id === event.id);

      const updatedEvent: Event = {
        ...event,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        drafts[existingIndex] = updatedEvent;
      } else {
        drafts.push(updatedEvent);
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(drafts));
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, getDrafts],
  );

  const deleteDraft = useCallback(
    (eventId: string) => {
      if (!storageKey || typeof window === "undefined") return;

      const drafts = getDrafts().filter((e) => e.id !== eventId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(drafts));
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey, getDrafts],
  );

  const getDraft = useCallback(
    (eventId: string): Event | undefined => {
      return getDrafts().find((e) => e.id === eventId);
    },
    [getDrafts],
  );

  return {
    drafts: getDrafts(),
    getDraft,
    saveDraft,
    deleteDraft,
  };
}
