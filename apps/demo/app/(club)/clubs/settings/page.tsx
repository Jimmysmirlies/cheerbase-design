"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { FadeInSection } from "@/components/ui";
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

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Club Settings"
        subtitle="Manage your club profile, preferences, and visibility."
        hideSubtitle
        breadcrumbItems={[
          { label: "Clubs", href: "/clubs" },
          { label: "Settings", href: "/clubs/settings" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 lg:px-8">
        <FadeInSection className="w-full">
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
        </FadeInSection>
      </div>
    </section>
  );
}
