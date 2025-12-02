"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ClubPageHeader } from "@/components/layout/ClubPageHeader";
import { ClubSidebar } from "@/components/layout/ClubSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";

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
          breadcrumbs={<span>Clubs / Settings</span>}
        />

        <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8">
          <section className="space-y-6">
            <form className="grid max-w-xl gap-4">
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Club Name</Label>
                <Input placeholder="e.g., Ralli All Stars" />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Contact Email</Label>
                <Input placeholder="club@example.com" type="email" />
              </div>
              <div className="flex gap-2">
                <Button type="button">Save Changes</Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
