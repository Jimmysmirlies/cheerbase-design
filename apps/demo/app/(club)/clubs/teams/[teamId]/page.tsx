"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@workspace/ui/shadcn/button";
import { formatFriendlyDate, formatPhoneNumber } from "@/utils/format";
import { useClubData } from "@/hooks/useClubData";
import { useAuth } from "@/components/providers/AuthProvider";
import { PageTitle } from "@/components/layout/PageTitle";
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
import type { Person, TeamRoster } from "@/types/club";

function DetailsInner() {
  const params = useParams<{ teamId: string }>();
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <TeamDetails teamId={params.teamId} />
    </main>
  );
}

export default function TeamDetailsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <DetailsInner />
    </Suspense>
  );
}

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

function TeamDetails({
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
  const { divisionLabel, levelLabel } = useMemo(() => {
    const parts = (team?.division ?? "")
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return { divisionLabel: "—", levelLabel: "—" };
    if (parts.length === 1) return { divisionLabel: parts[0], levelLabel: "—" };
    const level = parts.pop() ?? "—";
    return { divisionLabel: parts.join(" - "), levelLabel: level };
  }, [team?.division]);
  const memberCount =
    (roster?.coaches?.length ?? 0) +
    (roster?.athletes?.length ?? 0) +
    (roster?.reservists?.length ?? 0) +
    (roster?.chaperones?.length ?? 0);

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

  const pageTitle = team?.name ?? "Unknown Team";

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <PageTitle title={pageTitle} />
        <div className="pt-8">
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Loading team...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <PageTitle title={pageTitle} />
        <div className="pt-8">
          <div className="rounded-2xl border border-dashed p-6 text-sm text-destructive">
            Failed to load team.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageTitle
        title={pageTitle}
        subtitle={`${divisionLabel} · ${levelLabel} · ${memberCount} members`}
        actions={
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkOpen(true)}
            >
              Bulk Upload
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => setEditorOpen(true)}
            >
              Edit Team
            </Button>
          </div>
        }
      />

      <div className="pt-8">
        {onNavigateToTeams && (
          <div className="pb-6">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onNavigateToTeams}
            >
              ← Back to Teams
            </Button>
          </div>
        )}
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
    </section>
  );
}
