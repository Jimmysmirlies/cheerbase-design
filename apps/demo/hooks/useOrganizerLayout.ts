"use client";

import { useState, useEffect, useCallback } from "react";

export type OrganizerLayoutVariant = "A" | "B";

const STORAGE_KEY = "cheerbase-organizer-layout";

export function useOrganizerLayout() {
  const [layout, setLayoutState] = useState<OrganizerLayoutVariant>("A");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "A" || stored === "B") {
        setLayoutState(stored);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setLayout = useCallback((next: OrganizerLayoutVariant) => {
    setLayoutState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return { layout, setLayout };
}
