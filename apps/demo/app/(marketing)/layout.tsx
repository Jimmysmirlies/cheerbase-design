import type { ReactNode } from "react";

import { NavBar } from "@/components/layout/NavBar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-40">
        <NavBar />
      </div>
      <main className="bg-background text-foreground">{children}</main>
    </div>
  );
}
