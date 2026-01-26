import type { ReactNode } from "react";

/**
 * Focus Layout
 *
 * A minimal layout for focused flows like registration and checkout.
 * No NavBar, no sidebar - just clean full-screen content.
 * Similar to Airbnb/Eventbrite checkout experience.
 */
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
