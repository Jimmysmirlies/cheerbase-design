import type { ReactNode } from "react";

import { ScrollArea } from "@workspace/ui/shadcn/scroll-area";
import { NavBar } from "@/components/layout/NavBar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-background text-foreground">
      <ScrollArea className="h-full w-full">
        <div className="sticky top-0 z-40">
          <NavBar />
        </div>
        <main className="bg-background text-foreground">{children}</main>
      </ScrollArea>
    </div>
  );
}
