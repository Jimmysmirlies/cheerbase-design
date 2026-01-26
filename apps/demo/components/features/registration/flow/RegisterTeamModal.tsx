import { useEffect, useMemo, useState } from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";

import { ArrowLeftIcon, CheckIcon, UsersIcon } from "lucide-react";

import { GradientAvatar } from "@/components/ui/GradientAvatar";

import type { RegistrationEntry, TeamOption } from "./types";

type Step = 1 | 2;

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
  const [step, setStep] = useState<Step>(1);
  const [division, setDivision] = useState<string>("");
  const [teamId, setTeamId] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setDivision("");
      setTeamId("");
    }
  }, [open]);

  // Build a map of divisions to their available teams
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
    setTeamId("");
  };

  const handleContinue = () => {
    if (division) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setTeamId("");
  };

  const selectedTeam = teams.find((t) => t.id === teamId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="heading-3">Register Team</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground/80">
            {step === 1
              ? "Choose a division for your team entry"
              : `Select a team for ${division}`}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3">
            <StepIndicator
              number={1}
              label="Division"
              active={step === 1}
              completed={step > 1}
            />
            <div
              className={cn(
                "h-px flex-1 transition-colors duration-300",
                step > 1 ? "bg-foreground" : "bg-border",
              )}
            />
            <StepIndicator
              number={2}
              label="Team"
              active={step === 2}
              completed={false}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Step 1: Division Selection */}
          {step === 1 && (
            <div className="animate-in fade-in-0 slide-in-from-left-2 duration-200">
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                {divisions.map((div, index) => {
                  const teamsInDivision = divisionTeamsMap.get(div) ?? [];
                  const teamCount = teamsInDivision.length;
                  const isAvailable = teamCount > 0;

                  return (
                    <DivisionRow
                      key={div}
                      division={div}
                      teamCount={teamCount}
                      selected={division === div}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && handleDivisionSelect(div)}
                      index={index}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Team Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-2 duration-200">
              {availableTeams.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                  {availableTeams.map((team, index) => (
                    <SelectableTeamCard
                      key={team.id}
                      team={team}
                      selected={teamId === team.id}
                      onClick={() => setTeamId(team.id)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="body-small text-muted-foreground py-8 text-center border border-dashed border-border/60 rounded-lg bg-muted/20">
                  No teams available in this division
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!division}
                className="min-w-[120px]"
              >
                Continue
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="size-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {selectedTeam && (
                  <span className="body-small text-muted-foreground">
                    {selectedTeam.name}
                  </span>
                )}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="min-w-[120px]"
                >
                  Add Team
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Step indicator component
function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
          completed
            ? "bg-foreground text-background"
            : active
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground",
        )}
      >
        {completed ? <CheckIcon className="size-3.5" /> : number}
      </div>
      <span
        className={cn(
          "body-small font-medium transition-colors duration-300",
          active || completed ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

// Division row component - horizontal list item
function DivisionRow({
  division,
  teamCount,
  selected,
  disabled,
  onClick,
  index,
}: {
  division: string;
  teamCount: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-foreground bg-foreground/[0.03] shadow-sm"
          : disabled
            ? "border-border/40 bg-muted/20 cursor-not-allowed"
            : "border-border/60 hover:border-foreground/40 hover:bg-muted/30",
      )}
      style={{
        animationDelay: `${index * 30}ms`,
      }}
    >
      {/* Division name */}
      <span
        className={cn(
          "body-small font-medium flex-1 min-w-0",
          disabled ? "text-muted-foreground/50" : "text-foreground",
        )}
      >
        {division}
      </span>

      {/* Team count badge */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0",
          disabled
            ? "bg-muted/50 text-muted-foreground/40"
            : selected
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground",
        )}
      >
        <UsersIcon className="size-3" />
        {teamCount}
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="size-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
          <CheckIcon className="size-3 text-background" />
        </div>
      )}
    </button>
  );
}

// Team selection card
function SelectableTeamCard({
  team,
  selected,
  onClick,
  index,
}: {
  team: TeamOption;
  selected: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-foreground bg-foreground/[0.03] shadow-sm"
          : "border-border/60 hover:border-foreground/40 hover:bg-muted/30",
      )}
      style={{
        animationDelay: `${index * 40}ms`,
      }}
    >
      <GradientAvatar name={team.name} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="body-text font-medium truncate block">
          {team.name}
        </span>
        {team.size !== undefined && (
          <span className="body-small text-muted-foreground">
            {team.size} {team.size === 1 ? "member" : "members"}
          </span>
        )}
      </div>
      {selected && (
        <div className="size-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
          <CheckIcon className="size-3 text-background" />
        </div>
      )}
    </button>
  );
}
