"use client";
/**
 * RegistrationsSection
 *
 * Purpose
 * - View and edit event registrations before deadlines.
 * - Update athlete counts, swap members, and see invoice recalculations.
 *
 * Initial Implementation (Demo)
 * - Placeholder table rows with an Edit action that will open a dialog in a later step.
 */
import { Button } from "@workspace/ui/shadcn/button";
import Link from "next/link";
import { demoRegistrations } from "@/data/club/registrations";
import { demoTeams } from "@/data/club/teams";
import { demoRosters } from "@/data/club/members";
import { findEventById } from "@/data/event-categories";
import { formatCurrency, formatFriendlyDate } from "@/utils/format";
import { resolveDivisionPricing } from "@/utils/pricing";
import type { TeamRoster } from "@/types/club";

export default function RegistrationsSection() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Registrations</h2>
        <p className="text-sm text-muted-foreground">Edit entries before deadlines; totals update as you change rosters.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Event</th>
              <th className="px-4 py-3 text-left font-medium">Division</th>
              <th className="px-4 py-3 text-left font-medium">Team</th>
              <th className="px-4 py-3 text-left font-medium">Payment deadline</th>
              <th className="px-4 py-3 text-left font-medium">Participants</th>
              <th className="px-4 py-3 text-left font-medium">Invoice</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demoRegistrations.map((reg) => {
              const team = demoTeams.find((t) => t.id === reg.teamId);
              const roster = demoRosters.find((r) => r.teamId === reg.teamId);
              const participants = roster ? countRosterParticipants(roster) : reg.athletes;
              const event = findEventById(reg.eventId);
              const divisionPricing = event?.availableDivisions?.find((option) => option.name === reg.division);
              const invoiceTotal =
                divisionPricing && participants
                  ? formatCurrency(participants * resolveDivisionPricing(divisionPricing).price)
                  : reg.invoiceTotal;

              return (
                <tr key={reg.id} className="border-t">
                  <td className="px-4 py-3">{reg.eventName}</td>
                  <td className="px-4 py-3">{reg.division}</td>
                  <td className="px-4 py-3">{team?.name ?? reg.teamId}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatFriendlyDate(reg.paymentDeadline)}</td>
                  <td className="px-4 py-3">{participants}</td>
                  <td className="px-4 py-3">{invoiceTotal}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" type="button" asChild>
                      <Link href={`/clubs/registrations/${reg.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function countRosterParticipants(roster: TeamRoster) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  );
}
