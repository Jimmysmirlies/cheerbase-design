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
import { Suspense, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TeamDetails from "@/components/features/clubs/TeamDetails";
import TeamsSection from "@/components/features/clubs/TeamsSection";
import { ClubSidebar } from "@/components/layout/ClubSidebar";
import { ClubPageHeader } from "@/components/layout/ClubPageHeader";

function ClubsPageInner() {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("teamId");

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "club_owner") {
      router.replace(user.role === "organizer" ? "/organizer" : "/");
    }
  }, [user, status, router]);

  if (status === "loading") {
    return <main className="min-h-screen bg-background text-foreground" />;
  }

  if (!user || user.role !== "club_owner") {
    return null;
  }

  const clubInitial = (user.name ?? "Club")[0]?.toUpperCase() ?? "C";
  const clubLabel = user.name ? `${user.name}'s Club` : "Your Club";
  const ownerName = user.name ?? user.email ?? clubLabel;

  return (
    <main className="flex w-full">
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="teams" />

      <section className="flex flex-1 flex-col">
        <ClubPageHeader title="Teams" subtitle="Create teams and manage rosters for your club" hideSubtitle />
        <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
          {selectedTeamId ? (
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
          )}
        </div>
      </section>
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
