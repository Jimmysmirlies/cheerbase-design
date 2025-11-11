"use client";
/**
 * Team Details Page
 *
 * Purpose
 * - Deep-dive into a single team: roster by roles, quick settings access.
 *
 * Structure
 * - NavBar (clubs mode)
 * - Team header: name, division, counts, Team Settings dialog
 * - Tabs: Coaches | Athletes | Reservists | Chaperones
 */
import { Suspense } from "react";
import { useParams } from "next/navigation";
import TeamDetails from "@/components/features/clubs/TeamDetails";

function DetailsInner() {
  const params = useParams<{ teamId: string }>();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <TeamDetails teamId={params.teamId} />
      </div>
    </main>
  );
}

export default function TeamDetailsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}> 
      <DetailsInner />
    </Suspense>
  );
}
