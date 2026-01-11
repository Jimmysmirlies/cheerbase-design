"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { OrganizerLayoutVariant } from "@/hooks/useOrganizerLayout";

type LayoutContextValue = {
  layout: OrganizerLayoutVariant;
};

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

type LayoutProviderProps = {
  children: ReactNode;
  layout: OrganizerLayoutVariant;
};

export function LayoutProvider({ children, layout }: LayoutProviderProps) {
  return (
    <LayoutContext.Provider value={{ layout }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayoutContext must be used within LayoutProvider");
  }
  return ctx;
}

/** Safe version that returns default when used outside provider */
export function useLayoutContextSafe(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  return ctx ?? { layout: "A" };
}
