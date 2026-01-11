"use client";

import { useMemo } from "react";

import type {
  RegistrationEntry,
  RegistrationMember,
  EntryStatusMeta,
} from "./types";
import { TeamRow } from "./TeamRow";
import { UsersIcon } from "lucide-react";

export type DivisionQueueSectionProps = {
  entriesByDivision: Record<string, RegistrationEntry[]>;
  filteredEntriesByDivision: Record<string, RegistrationEntry[]>;
  allEntries: RegistrationEntry[];
  divisionOptions: string[];
  searchTerm: string;
  onRemoveEntry: (id: string) => void;
  onUpdateEntryMembers: (id: string, members: RegistrationMember[]) => void;
  readOnly: boolean;
  getEntryStatus: (entry: RegistrationEntry) => EntryStatusMeta;
};

export function DivisionQueueSection({
  entriesByDivision,
  filteredEntriesByDivision,
  allEntries,
  divisionOptions,
  searchTerm,
  onRemoveEntry,
  onUpdateEntryMembers,
  readOnly,
  getEntryStatus,
}: DivisionQueueSectionProps) {
  const baseDivisions = useMemo(() => {
    if (divisionOptions.length) {
      return Array.from(new Set(divisionOptions));
    }
    return Array.from(new Set(allEntries.map((entry) => entry.division)));
  }, [divisionOptions, allEntries]);

  const divisionsToRender = useMemo(() => {
    if (!searchTerm) return baseDivisions;
    return baseDivisions.filter(
      (division) => (filteredEntriesByDivision[division]?.length ?? 0) > 0,
    );
  }, [baseDivisions, filteredEntriesByDivision, searchTerm]);

  const shouldShowGlobalEmpty = divisionsToRender.length === 0;

  if (shouldShowGlobalEmpty) {
    return (
      <div className="border-border/70 text-muted-foreground rounded-xl border border-dashed p-6 text-center body-small">
        {searchTerm
          ? "No teams match your search yet."
          : "No teams added yet. Start by registering a team."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {divisionsToRender.map((divisionName) => {
        const divisionEntries =
          (searchTerm
            ? filteredEntriesByDivision[divisionName]
            : entriesByDivision[divisionName]) ?? [];

        return (
          <div key={divisionName} className="border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="heading-4">{divisionName}</p>
              <span className="body-small text-muted-foreground">
                {divisionEntries.length}{" "}
                {divisionEntries.length === 1 ? "team" : "teams"} registered
              </span>
            </div>
            {divisionEntries.length ? (
              <div className="space-y-3">
                {divisionEntries.map((entry) => (
                  <TeamRow
                    key={entry.id}
                    entry={entry}
                    onRemove={() => onRemoveEntry(entry.id)}
                    onUpdateMembers={(members) =>
                      onUpdateEntryMembers(entry.id, members)
                    }
                    status={getEntryStatus(entry)}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            ) : (
              <div className="border-border/60 text-muted-foreground flex flex-col gap-2 border-y border-dashed px-4 py-6 text-sm">
                <UsersIcon
                  className="size-6 text-muted-foreground/50"
                  aria-hidden
                />
                <span>No teams registered for this division yet.</span>
              </div>
            )}
            <div className="mt-4 h-px w-full bg-border" />
          </div>
        );
      })}
    </div>
  );
}
