"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ClubSettingsSection from "@/components/features/clubs/ClubSettingsSection";
import { ClubPageHeader } from "@/components/layout/ClubPageHeader";
import { ClubSidebar } from "@/components/layout/ClubSidebar";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ClubSettingsPage() {
  const { user, status } = useAuth();
  const router = useRouter();

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
    return <main className="min-h-screen bg-background" />;
  }
  if (!user || user.role !== "club_owner") return null;

  const clubInitial = (user.name ?? "Club")[0]?.toUpperCase() ?? "C";
  const clubLabel = user.name ? `${user.name}'s Club` : "Your Club";
  const ownerName = user.name ?? user.email ?? clubLabel;

  return (
    <main className="flex w-full">
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="settings" />

      <section className="flex flex-1 flex-col">
        <ClubPageHeader
          title="Club Settings"
          subtitle="Manage your club profile, preferences, and visibility."
          hideSubtitle
        />

        <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-8">
          <ClubSettingsSection />
        </div>
      </section>
    </main>
  );
}
