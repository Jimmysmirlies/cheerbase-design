import { useEffect, useMemo, useState } from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";

import { GradientAvatar } from "@/components/ui/GradientAvatar";

import type { RegistrationEntry, TeamOption } from "./types";

type RegisterTeamModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  divisions: string[];
  teams: TeamOption[];
  onSubmit: (entry: RegistrationEntry) => void;
};

export function RegisterTeamModal({
  open,
  onOpenChange,
  divisions,
  teams,
  onSubmit,
}: RegisterTeamModalProps) {
  const [division, setDivision] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setDivision("");
      setTeamId("");
    }
  }, [open]);

  // Build a map of divisions to their available teams
  // Teams can only be registered in divisions that match their team.division
  const divisionTeamsMap = useMemo(() => {
    const map = new Map<string, TeamOption[]>();

    divisions.forEach((div) => {
      const teamsInDivision = teams.filter((team) => team.division === div);
      map.set(div, teamsInDivision);
    });

    return map;
  }, [divisions, teams]);

  // Get teams for the selected division
  const availableTeams = useMemo(() => {
    if (!division) return [];
    return divisionTeamsMap.get(division) ?? [];
  }, [division, divisionTeamsMap]);

  const canSubmit = Boolean(division && teamId);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `entry-${Date.now()}`;

    onSubmit({
      id,
      division,
      mode: "existing",
      teamId: team.id,
      teamName: team.name,
      teamSize: team.size,
    });

    onOpenChange(false);
  };

  const handleDivisionSelect = (divisionName: string) => {
    setDivision(divisionName);
    setTeamId(""); // Reset team selection when division changes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl rounded-md gap-6">
        <DialogHeader>
          <DialogTitle className="heading-4">Register a Team</DialogTitle>
          <DialogDescription className="body-small">
            Select a division and team to add to your registration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Division Selection */}
          <div className="space-y-3 pt-0">
            <label className="label text-muted-foreground">Division</label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {divisions.map((div) => {
                const teamsInDivision = divisionTeamsMap.get(div) ?? [];
                const hasTeamsInDivision = teamsInDivision.length > 0;
                return (
                  <DivisionCard
                    key={div}
                    division={div}
                    teamCount={teamsInDivision.length}
                    selected={division === div}
                    disabled={!hasTeamsInDivision}
                    onClick={() => handleDivisionSelect(div)}
                  />
                );
              })}
            </div>
          </div>

          {/* Step 2: Team Selection - only shown after division is selected */}
          {division && (
            <div className="space-y-3">
              <label className="label text-muted-foreground">Team</label>
              {availableTeams.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {availableTeams.map((team) => (
                    <SelectableTeamCard
                      key={team.id}
                      team={team}
                      selected={teamId === team.id}
                      onClick={() => setTeamId(team.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="body-small text-muted-foreground py-4 text-center border border-dashed rounded-md">
                  No teams available to register.
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            Add Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Division card - selectable grid item
function DivisionCard({
  division,
  teamCount,
  selected,
  disabled,
  onClick,
}: {
  division: string;
  teamCount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/60 hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-50 hover:border-border/60",
      )}
    >
      <p className="body-text font-medium">{division}</p>
      <p className="body-small text-muted-foreground">
        {teamCount === 0
          ? "No teams available to register"
          : teamCount === 1
            ? "1 team available"
            : `${teamCount} teams available`}
      </p>
    </button>
  );
}

// Simplified team card - selectable list item
function SelectableTeamCard({
  team,
  selected,
  onClick,
}: {
  team: TeamOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/60 hover:border-primary/40",
      )}
    >
      <GradientAvatar name={team.name} size="sm" />
      <span className="body-text font-medium truncate">{team.name}</span>
    </button>
  );
}
