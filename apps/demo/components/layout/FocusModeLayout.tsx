"use client";

import type { ReactNode } from "react";

type FocusModeLayoutProps = {
  children: ReactNode;
};

/**
 * FocusModeLayout provides a minimal shell for focus mode pages.
 * The header and sidebar are rendered by child components (via EventEditorProvider context).
 * This layout just provides the basic structure without sidebar navigation.
 */
export function FocusModeLayout({ children }: FocusModeLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
