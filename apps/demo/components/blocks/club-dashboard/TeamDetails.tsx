"use client";
/**
 * TeamDetails
 *
 * Purpose
 * - Reusable renderer for a team's details: header, settings, and roster tabs.
 * - Used inside the Clubs page (keeps sidebar persistent) and the standalone route.
 */
import { useMemo, useState } from "react";
import TeamHeaderCard from "./TeamHeaderCard";
import { demoTeams } from "@/data/club/teams";
import { demoRosters } from "@/data/club/members";
import type { Person, TeamRoster } from "@/types/club";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/shadcn/tabs";
import { Button } from "@workspace/ui/shadcn/button";
import AddMemberDialog from "./AddMemberDialog";
import EditMemberDialog from "./EditMemberDialog";
import { usePersistentRoster } from "@/hooks/usePersistentRoster";
import { formatFriendlyDate, formatPhoneNumber } from "@/utils/format";
import { downloadTextFile } from "@/utils/download";

function RosterTable({
  people,
  onUpdate,
  onRemove,
}: {
  people: Person[];
  onUpdate: (p: Person) => void;
  onRemove: (id: string) => void;
}) {
  if (people.length === 0) {
    return <p className="text-sm text-muted-foreground">No members in this list yet.</p>;
  }
  return <InlineEditableTable rows={people} onUpdate={onUpdate} onRemove={onRemove} />;
}

function InlineEditableTable({ rows, onUpdate, onRemove }: { rows: Person[]; onUpdate: (p: Person) => void; onRemove: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">DOB</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t align-top">
              <td className="px-4 py-3">{`${p.firstName} ${p.lastName}`}</td>
              <td className="px-4 py-3">{formatFriendlyDate(p.dob)}</td>
              <td className="px-4 py-3">{p.email ?? "—"}</td>
              <td className="px-4 py-3">{formatPhoneNumber(p.phone)}</td>
              <td className="px-4 py-3 text-right">
                <EditMemberDialog
                  person={p}
                  onSave={onUpdate}
                  onRemove={onRemove}
                  trigger={
                    <Button variant="outline" size="sm" type="button">
                      Edit
                    </Button>
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TeamDetails({ teamId, onNavigateToTeams }: { teamId: string; onNavigateToTeams?: () => void }) {
  const team = useMemo(() => demoTeams.find((t) => t.id === teamId), [teamId]);
  const initialRoster = useMemo<TeamRoster>(() => {
    return (
      demoRosters.find((r) => r.teamId === teamId) || {
        teamId,
        coaches: [],
        athletes: [],
        reservists: [],
        chaperones: [],
      }
    );
  }, [teamId]);
  const [roster, setRoster] = usePersistentRoster(teamId, initialRoster);
  const [activeTab, setActiveTab] = useState<"coaches" | "athletes" | "reservists" | "chaperones">("athletes");

  const combinedMembers = useMemo(() => {
    return [
      ...roster.coaches.map((person) => ({ person, role: "Coach" })),
      ...roster.athletes.map((person) => ({ person, role: "Athlete" })),
      ...roster.reservists.map((person) => ({ person, role: "Reservist" })),
      ...roster.chaperones.map((person) => ({ person, role: "Chaperone" })),
    ];
  }, [roster]);

  const handleExportCsv = () => {
    const teamName = team?.name ?? "team";
    const headers = ["Team Name", "Role", "First Name", "Last Name", "Date of Birth", "Email", "Phone"];
    const escape = (value: string) => {
      if (/,|"|\n/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };
    const rows = combinedMembers.map(({ person, role }) => [
      teamName,
      role,
      person.firstName ?? "",
      person.lastName ?? "",
      person.dob ?? "",
      person.email ?? "",
      person.phone ?? "",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => escape(cell ?? "")).join(",")).join("\n");
    const filename = `${teamName.replace(/\s+/g, "-").toLowerCase()}-roster.csv`;
    downloadTextFile(filename, csv);
  };

  const handleDownloadTemplate = () => {
    const headers = "Team Name,Role,First Name,Last Name,Date of Birth,Email,Phone";
    const csv = `${headers}\n`;
    downloadTextFile("team-roster-template.csv", csv);
  };

  const roleLabel =
    activeTab === "coaches"
      ? "Coach"
      : activeTab === "athletes"
        ? "Athlete"
        : activeTab === "reservists"
          ? "Reservist"
          : "Chaperone";

  return (
    <div className="space-y-6">
      {/* Top bar: breadcrumbs only; align to top */}
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">
          {onNavigateToTeams ? (
            <button className="underline-offset-4 hover:underline" onClick={onNavigateToTeams} type="button">
              Teams
            </button>
          ) : (
            <span>Teams</span>
          )}
          <span className="mx-2">/</span>
          <span className="text-foreground">{team?.name ?? "Unknown Team"}</span>
        </div>
        <span />
      </div>

      {/* Team header card */}
      <TeamHeaderCard
        name={team?.name ?? "Unknown Team"}
        division={team?.division ?? "TBD"}
        size={team?.size ?? 0}
        coedCount={team?.coedCount ?? 0}
      />

      {/* Card acts as a natural separator; no divider */}

      {/* Roster by roles + inline actions */}
      <Tabs
        value={activeTab}
        onValueChange={(v: string) =>
          setActiveTab(v as "coaches" | "athletes" | "reservists" | "chaperones")}
        className="space-y-0"
      >
        <div className="mb-3 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="reservists">Reservists</TabsTrigger>
            <TabsTrigger value="chaperones">Chaperones</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={handleDownloadTemplate}>
              Download Template
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={handleExportCsv}>
              Export CSV
            </Button>
            <AddMemberDialog
              roleLabel={roleLabel}
              onAdd={(person) => {
                setRoster((r) => {
                  const next = { ...r } as TeamRoster;
                  if (activeTab === "coaches") next.coaches = [...r.coaches, person];
                  if (activeTab === "athletes") next.athletes = [...r.athletes, person];
                  if (activeTab === "reservists") next.reservists = [...r.reservists, person];
                  if (activeTab === "chaperones") next.chaperones = [...r.chaperones, person];
                  return next;
                });
              }}
            />
          </div>
        </div>

        <TabsContent value="coaches">
          <RosterTable
            people={roster?.coaches ?? []}
            onUpdate={(updated) =>
              setRoster((r) => ({ ...r, coaches: r.coaches.map((p) => (p.id === updated.id ? updated : p)) }))
            }
            onRemove={(id) => setRoster((r) => ({ ...r, coaches: r.coaches.filter((p) => p.id !== id) }))}
          />
        </TabsContent>
        <TabsContent value="athletes">
          <RosterTable
            people={roster?.athletes ?? []}
            onUpdate={(updated) =>
              setRoster((r) => ({ ...r, athletes: r.athletes.map((p) => (p.id === updated.id ? updated : p)) }))
            }
            onRemove={(id) => setRoster((r) => ({ ...r, athletes: r.athletes.filter((p) => p.id !== id) }))}
          />
        </TabsContent>
        <TabsContent value="reservists">
          <RosterTable
            people={roster?.reservists ?? []}
            onUpdate={(updated) =>
              setRoster((r) => ({ ...r, reservists: r.reservists.map((p) => (p.id === updated.id ? updated : p)) }))
            }
            onRemove={(id) => setRoster((r) => ({ ...r, reservists: r.reservists.filter((p) => p.id !== id) }))}
          />
        </TabsContent>
        <TabsContent value="chaperones">
          <RosterTable
            people={roster?.chaperones ?? []}
            onUpdate={(updated) =>
              setRoster((r) => ({ ...r, chaperones: r.chaperones.map((p) => (p.id === updated.id ? updated : p)) }))
            }
            onRemove={(id) => setRoster((r) => ({ ...r, chaperones: r.chaperones.filter((p) => p.id !== id) }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
