'use client';

/**
 * Organizer Shell ("Portal Frame")
 *
 * Sections
 * - Top Bar: organizer variant of the global NavBar.
 * - Edge Rail: collapsible left sidebar with tooltips when icon-only.
 * - Content Canvas: centered page container to the right of the rail.
 */

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { NavBar } from "@/components/layout/NavBar";
import { OrganizerSidebar } from "@/components/layout/OrganizerSidebar";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/");
    }
  }, [user, status, router]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Top Bar */}
      <NavBar variant="organizer" showNavLinks={false} />
      <div className="flex w-full gap-6">
        <OrganizerSidebar />

        {/* Content Canvas */}
        <div className="flex-1">
          <section className="mx-auto w-full max-w-6xl p-6">
            {status === "loading" ? null : children}
          </section>
        </div>
      </div>
    </div>
  );
}
