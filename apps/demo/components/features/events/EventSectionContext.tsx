"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BrandGradient } from "@/lib/gradients";

type EventSectionContextType = {
  activeSection: string | null;
  setActiveSection: (id: string | null) => void;
  gradient: BrandGradient;
  setGradient: (gradient: BrandGradient) => void;
};

const EventSectionContext = createContext<EventSectionContextType | null>(null);

type EventSectionProviderProps = {
  children: ReactNode;
  initialGradient?: BrandGradient;
};

export function EventSectionProvider({
  children,
  initialGradient = "teal",
}: EventSectionProviderProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [gradient, setGradient] = useState<BrandGradient>(initialGradient);

  return (
    <EventSectionContext.Provider
      value={{ activeSection, setActiveSection, gradient, setGradient }}
    >
      {children}
    </EventSectionContext.Provider>
  );
}

export function useEventSection() {
  const context = useContext(EventSectionContext);
  if (!context) {
    // Return a fallback for when used outside provider (non-event pages)
    return {
      activeSection: null,
      setActiveSection: () => {},
      gradient: "teal" as BrandGradient,
      setGradient: () => {},
    };
  }
  return context;
}

/**
 * Hook to check if a specific section is currently active
 */
export function useIsSectionActive(sectionId: string): boolean {
  const { activeSection } = useEventSection();
  return activeSection === sectionId;
}
