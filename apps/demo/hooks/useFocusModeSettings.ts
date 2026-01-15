"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "cheerbase-focus-mode-sidebar";

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

  const updateSettings = useCallback((updates: Partial<FocusModeSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    updateSettings({ sidebarOpen: !settings.sidebarOpen });
  }, [settings.sidebarOpen, updateSettings]);

  return {
    sidebarOpen: settings.sidebarOpen,
    setSidebarOpen: (open: boolean) => updateSettings({ sidebarOpen: open }),
    toggleSidebar,
    isHydrated,
  };
}
