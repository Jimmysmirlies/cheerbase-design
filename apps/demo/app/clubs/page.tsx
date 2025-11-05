"use client";
/**
 * My Club Page
 *
 * Purpose
 * - Club Owner workspace to manage Teams, Registrations, and Club Settings.
 * - Layout inspired by Airbnb profile: left-side vertical nav, content on the right.
 *
 * Structure
 * - NavBar (clubs mode: no search, "Explore Events" link)
 * - Two-column layout:
 *   - Aside: vertical nav (Teams, Registrations, Club Settings)
 *   - Main: section content
 */
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UsersIcon, ReceiptIcon, SettingsIcon } from "lucide-react";
import TeamDetails from "@/components/club/TeamDetails";
import { NavBar } from "@/components/nav-bar";
import TeamsSection from "@/components/club/TeamsSection";
import RegistrationsSection from "@/components/club/RegistrationsSection";
import ClubSettingsSection from "@/components/club/ClubSettingsSection";

type ClubView = "teams" | "registrations" | "settings";

function ClubsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as ClubView) || "teams";
  const selectedTeamId = searchParams.get("teamId");
  const [view, setView] = useState<ClubView>(initialView);

  // Keep URL in sync when view changes (without full navigation)
  useEffect(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header: NavBar without search, with "Explore Events" link */}
      <NavBar showSearch={false} mode="clubs" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-[220px_1fr]">
        {/* Left-side navigation */}
        <aside className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">My Club</h2>
          <nav className="flex flex-col gap-2 text-sm font-medium">
            <button
              className={`rounded-2xl px-4 py-3 text-left transition ${
                view === "teams" ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => setView("teams")}
              type="button"
            >
              <span className="inline-flex items-center gap-2"><UsersIcon className="h-4 w-4" /> Teams</span>
            </button>
            <button
              className={`rounded-2xl px-4 py-3 text-left transition ${
                view === "registrations" ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => setView("registrations")}
              type="button"
            >
              <span className="inline-flex items-center gap-2"><ReceiptIcon className="h-4 w-4" /> Registrations</span>
            </button>
            <button
              className={`rounded-2xl px-4 py-3 text-left transition ${
                view === "settings" ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
              onClick={() => setView("settings")}
              type="button"
            >
              <span className="inline-flex items-center gap-2"><SettingsIcon className="h-4 w-4" /> Club Settings</span>
            </button>
          </nav>
        </aside>

        {/* Main content area */}
        <section className="space-y-6">
          {view === "teams" ? (
            selectedTeamId ? (
              <TeamDetails
                teamId={selectedTeamId}
                onNavigateToTeams={() => {
                  const params = new URLSearchParams(Array.from(searchParams.entries()));
                  params.delete("teamId");
                  router.replace(`${pathname}?${params.toString()}`);
                }}
              />
            ) : (
              <TeamsSection />
            )
          ) : null}
          {view === "registrations" ? <RegistrationsSection /> : null}
          {view === "settings" ? <ClubSettingsSection /> : null}
        </section>
      </div>
    </main>
  );
}

export default function ClubsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}> 
      <ClubsPageInner />
    </Suspense>
  );
}
