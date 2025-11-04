"use client";
/**
 * TeamsSection
 *
 * Purpose
 * - Display a grid of teams/division teams managed by the club owner.
 * - Entry points to team details: coaches, athletes, reservists, chaperones.
 *
 * Initial Implementation (Demo)
 * - Placeholder grid cards; real data wired in a later step.
 * - Upload controls are stubbed; CSV/Excel preview and dedupe checks to follow.
 */
import { Button } from "@workspace/ui/shadcn/button";
import { demoTeams } from "@/data/club/teams";
import UploadRosterDialog from "@/components/club/UploadRosterDialog";
import { useRouter } from "next/navigation";

export default function TeamsSection() {
  const router = useRouter();
  return (
    <section className="space-y-6">
      {/* Section header: title + actions */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground">Create or upload teams; click a team to manage its roster.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" type="button">Create Team</Button>
          <UploadRosterDialog />
        </div>
      </div>

      {/* Data-driven TeamCard grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {demoTeams.map((team) => (
          <article key={team.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/60">
            <h3 className="text-sm font-semibold">{team.name}</h3>
            <p className="text-xs text-muted-foreground">Division: {team.division} • Size: {team.size} • COED: {team.coedCount}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" type="button" onClick={() => router.push(`/clubs?view=teams&teamId=${team.id}`)}>
                View
              </Button>
              <Button size="sm" type="button" onClick={() => router.push(`/clubs?view=teams&teamId=${team.id}`)}>
                Manage
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
