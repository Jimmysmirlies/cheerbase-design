"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ClubSettingsSection from "@/components/features/clubs/ClubSettingsSection";
import { ClubPageHeader } from "@/components/layout/ClubPageHeader";
import { ClubSidebar } from "@/components/layout/ClubSidebar";
import { useAuth } from "@/components/providers/AuthProvider";
import { SidebarProvider, SidebarInset, Sidebar } from "@workspace/ui/shadcn/sidebar";
import type { CSSProperties } from "react";

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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as CSSProperties
      }
    >
      <Sidebar collapsible="icon" variant="sidebar">
        <div className="h-full pt-16">
          <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} active="settings" />
        </div>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <ClubPageHeader
            title="Club Settings"
            subtitle="Manage your club profile, preferences, and visibility."
          />

          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-6xl space-y-8 px-6 py-8 lg:mx-auto">
              <ClubSettingsSection />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
