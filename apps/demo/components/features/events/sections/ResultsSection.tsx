"use client";

import { Share2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import type { Event } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type ResultsSectionProps = Omit<BaseSectionProps, "onUpdate">;

/**
 * ResultsSection displays event results and leaderboard.
 * This section is currently view-only (not editable).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ResultsSection(_: ResultsSectionProps) {
  // Results section is always the same regardless of mode
  // (not currently editable)
  return (
    <div className="rounded-md border border-border/70 bg-card/60 p-6 transition-all hover:border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-foreground font-medium">Coming soon</p>
          <p className="body-small text-muted-foreground">
            Scores and placements will publish once awards conclude.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled>
          <Share2Icon className="mr-2 size-4" />
          Notify me
        </Button>
      </div>
    </div>
  );
}

/** Check if section has data to display - always show results section */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
ResultsSection.hasData = (_: Partial<Event>): boolean => {
  return true; // Results section always shows (even if just "Coming soon")
};

/** Results section is not editable */
ResultsSection.editable = false;
