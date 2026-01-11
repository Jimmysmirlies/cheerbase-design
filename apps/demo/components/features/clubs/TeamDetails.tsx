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
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from "@/components/ui/tables";
import type { TeamOption } from "@/components/features/registration/flow/types";
import type { DivisionPricing } from "@/types/events";

function RosterTable({ people }: { people: (Person & { role?: string })[] }) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No members in this list yet.
      </p>
    );
  }
  return (
    <DataTable>
      <DataTableHeader>
        <tr>
          <DataTableHead>Name</DataTableHead>
          <DataTableHead>DOB</DataTableHead>
          <DataTableHead>Email</DataTableHead>
          <DataTableHead>Phone</DataTableHead>
          <DataTableHead>Role</DataTableHead>
        </tr>
      </DataTableHeader>
      <DataTableBody>
        {people.map((p, index) => (
          <DataTableRow key={p.id} animationDelay={index * 40}>
            <DataTableCell className="text-foreground">{`${p.firstName} ${p.lastName}`}</DataTableCell>
            <DataTableCell>{formatFriendlyDate(p.dob)}</DataTableCell>
            <DataTableCell>{p.email ?? "—"}</DataTableCell>
            <DataTableCell>{formatPhoneNumber(p.phone)}</DataTableCell>
            <DataTableCell className="text-muted-foreground">
              {p.role ?? "—"}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

export default function TeamDetails({
  teamId,
  onNavigateToTeams,
}: {
  teamId: string;
  onNavigateToTeams?: () => void;
}) {
  const { user } = useAuth();
  const { data, loading, error } = useClubData(user?.id);
  const team = useMemo(
    () => data?.teams.find((t) => t.id === teamId),
    [data?.teams, teamId],
  );
  const initialRoster = useMemo<TeamRoster>(() => {
    const empty = {
      teamId,
      coaches: [],
      athletes: [],
      reservists: [],
      chaperones: [],
    };
    if (!data) return empty as TeamRoster;
    return (
      data.rosters.find((r) => r.teamId === teamId) || (empty as TeamRoster)
    );
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
    [combinedMembers],
  );

  const registrationMembersToRoster = (
    members: {
      name?: string;
      type?: string;
      dob?: string;
      email?: string;
      phone?: string;
    }[],
  ): TeamRoster => {
    const empty: TeamRoster = {
      teamId,
      coaches: [],
      athletes: [],
      reservists: [],
      chaperones: [],
    };
    members.forEach((m, idx) => {
      const [first = "", last = ""] = (m.name ?? `Member ${idx + 1}`).split(
        " ",
      );
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
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
        Loading team...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed p-6 text-sm text-destructive">
        Failed to load team.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToTeams ? (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onNavigateToTeams}
            >
              ← Back to Teams
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBulkOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
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
            }) as TeamOption,
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
