"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cheerbase-focus-mode-sidebar";
const EVENT_NAME = "focus-mode-settings-changed";
const MOBILE_SHEET_EVENT = "focus-mode-mobile-sheet";

type FocusModeSettings = {
  sidebarOpen: boolean;
};

const defaultSettings: FocusModeSettings = {
  sidebarOpen: true,
};

export function useFocusModeSettings() {
  const [settings, setSettingsState] =
    useState<FocusModeSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FocusModeSettings;
        setSettingsState(parsed);
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true);
  }, []);

  // Listen for cross-component state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSettingsChange = (event: Event) => {
      const customEvent = event as CustomEvent<FocusModeSettings>;
      setSettingsState(customEvent.detail);
    };

    window.addEventListener(EVENT_NAME, handleSettingsChange);
    return () => window.removeEventListener(EVENT_NAME, handleSettingsChange);
  }, []);

  const updateSettings = useCallback((updates: Partial<FocusModeSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // Dispatch event to sync other components (deferred to avoid React render conflicts)
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
        });
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    updateSettings({ sidebarOpen: !settings.sidebarOpen });
  }, [settings.sidebarOpen, updateSettings]);

  // Request mobile sheet to open (for cross-component communication)
  const requestMobileSheetOpen = useCallback(() => {
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent(MOBILE_SHEET_EVENT));
    });
  }, []);

  return {
    sidebarOpen: settings.sidebarOpen,
    setSidebarOpen: (open: boolean) => updateSettings({ sidebarOpen: open }),
    toggleSidebar,
    requestMobileSheetOpen,
    isHydrated,
    // Export event name for listeners
    MOBILE_SHEET_EVENT,
  };
}
