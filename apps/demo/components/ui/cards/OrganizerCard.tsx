"use client";

/**
 * OrganizerCard
 *
 * Purpose
 * - Compact identity card for an organizer, used in horizontal rails.
 *
 * Structure
 * - Avatar circle with gradient background and initials
 * - Name + region text
 * - Visibility badge (e.g., Public / Invite-only)
 */
type OrganizerCardProps = {
  name: string;
  region: string;
  visibility: string;
  accentGradient: string;
};

import { Badge } from "@workspace/ui/shadcn/badge";

import { GlassCard } from "@/components/ui/glass/GlassCard";

export function OrganizerCard({
  name,
  region,
  visibility,
  accentGradient,
}: OrganizerCardProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <GlassCard className="min-w-[220px] snap-start p-6 text-center">
      {/* Gradient avatar with initials */}
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${accentGradient} text-base font-semibold text-white shadow`}
      >
        {initials}
      </div>
      {/* Text content */}
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">{region}</p>
        <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase">
          {visibility}
        </Badge>
      </div>
    </GlassCard>
  );
}
