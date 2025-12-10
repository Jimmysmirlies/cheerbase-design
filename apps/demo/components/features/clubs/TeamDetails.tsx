"use client";
/**
 * TeamDetails
 *
 * Purpose
 * - Reusable renderer for a team's details: header, settings, and roster tabs.
 * - Used inside the Clubs page (keeps sidebar persistent) and the standalone route.
 */
import { useEffect, useMemo, useState } from "react";
import type { Person, TeamRoster } from "@/types/club";
import { Button } from "@workspace/ui/shadcn/button";
import { formatFriendlyDate, formatPhoneNumber } from "@/utils/format";
import { useClubData } from "@/hooks/useClubData";
import { useAuth } from "@/components/providers/AuthProvider";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import type { TeamOption } from "@/components/features/registration/flow/types";
import type { DivisionPricing } from "@/types/events";

function RosterTable({
  people,
}: {
  people: (Person & { role?: string })[];
}) {
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">No members in this list yet.</p>;
  }
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">DOB</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} className="border-t align-top">
              <td className="px-4 py-3">{`${p.firstName} ${p.lastName}`}</td>
              <td className="px-4 py-3">{formatFriendlyDate(p.dob)}</td>
              <td className="px-4 py-3">{p.email ?? "—"}</td>
              <td className="px-4 py-3">{formatPhoneNumber(p.phone)}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.role ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeamDetails({ teamId, onNavigateToTeams }: { teamId: string; onNavigateToTeams?: () => void }) {
  const { user } = useAuth();
  const { data, loading, error } = useClubData(user?.id);
  const team = useMemo(() => data?.teams.find((t) => t.id === teamId), [data?.teams, teamId]);
  const initialRoster = useMemo<TeamRoster>(() => {
    const empty = { teamId, coaches: [], athletes: [], reservists: [], chaperones: [] };
    if (!data) return empty as TeamRoster;
    return data.rosters.find((r) => r.teamId === teamId) || (empty as TeamRoster);
  }, [data, teamId]);
  const [roster, setRoster] = useState<TeamRoster>(initialRoster);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    setRoster(initialRoster);
  }, [initialRoster]);

  const combinedMembers: (Person & { role?: string })[] = useMemo(() => {
    return [
      ...roster.coaches.map((person) => ({ ...person, role: "Coach" })),
      ...roster.athletes.map((person) => ({ ...person, role: "Athlete" })),
      ...roster.reservists.map((person) => ({ ...person, role: "Reservist" })),
      ...roster.chaperones.map((person) => ({ ...person, role: "Chaperone" })),
    ];
  }, [roster]);

  const editorMembers = useMemo(
    () =>
      combinedMembers.map((m) => ({
        name: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
        type: m.role ?? "Athlete",
        dob: m.dob,
        email: m.email,
        phone: m.phone,
      })),
    [combinedMembers]
  );

  const registrationMembersToRoster = (members: { name?: string; type?: string; dob?: string; email?: string; phone?: string }[]): TeamRoster => {
    const empty: TeamRoster = { teamId, coaches: [], athletes: [], reservists: [], chaperones: [] };
    members.forEach((m, idx) => {
      const [first = "", last = ""] = (m.name ?? `Member ${idx + 1}`).split(" ");
      const person: Person = {
        id: `${teamId}-${idx}-${m.type ?? "athlete"}`,
        firstName: first,
        lastName: last,
        dob: m.dob,
        email: m.email,
        phone: m.phone,
      };
      const role = (m.type ?? "athlete").toLowerCase();
      if (role === "coach") empty.coaches.push(person);
      else if (role === "reservist") empty.reservists.push(person);
      else if (role === "chaperone") empty.chaperones.push(person);
      else empty.athletes.push(person);
    });
    return empty;
  };

  if (loading) {
    return <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">Loading team...</div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-dashed p-6 text-sm text-destructive">Failed to load team.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToTeams ? (
            <Button variant="ghost" size="sm" type="button" onClick={onNavigateToTeams}>
              ← Back to Teams
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
            Bulk Upload
          </Button>
          <Button type="button" variant="default" size="sm" onClick={() => setEditorOpen(true)}>
            Edit Team
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <RosterTable people={combinedMembers} />
      </div>

      <BulkUploadDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        divisionPricing={[] as DivisionPricing[]}
        teamOptions={(data?.teams ?? []).map(
          (t) =>
            ({
              id: t.id,
              name: t.name,
              division: t.division,
            }) as TeamOption
        )}
        onImport={(entries) => {
          void entries;
          setBulkOpen(false);
        }}
      />
      <RosterEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        members={editorMembers}
        teamName={team?.name ?? "Team"}
        onSave={(nextMembers) => {
          setRoster(registrationMembersToRoster(nextMembers));
          setEditorOpen(false);
        }}
      />
    </div>
  );
}
