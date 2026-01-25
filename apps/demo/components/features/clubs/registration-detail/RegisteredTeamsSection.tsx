"use client";

import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  LockIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/shadcn/button";
import { fadeInUp } from "@/lib/animations";
import { TeamCard, type TeamData } from "@/components/features/clubs/TeamCard";
import type { RegisteredTeamData, EditModeInvoice } from "./types";

type RegisteredTeamsSectionProps = {
  allDivisions: string[];
  teamsByDivision: Map<string, RegisteredTeamData[]>;
  isEditMode: boolean;
  isLocked: boolean;
  registrationDeadlineLabel: string | null;
  // Edit mode handlers
  onBulkUpload?: () => void;
  onRegisterTeam?: () => void;
  onEditRegistration?: () => void;
  onEditTeam?: (team: TeamData) => void;
  onDiscardChanges?: () => void;
  // For showing stored changes notice
  hasStoredChanges?: boolean;
  editModeInvoice?: EditModeInvoice;
  // Hide header when rendered inside tab with its own header
  hideHeader?: boolean;
  // Hide notices when rendered in parent
  hideNotices?: boolean;
};

export function RegisteredTeamsSection({
  allDivisions,
  teamsByDivision,
  isEditMode,
  isLocked,
  registrationDeadlineLabel,
  onBulkUpload,
  onRegisterTeam,
  onEditRegistration,
  onEditTeam,
  onDiscardChanges,
  hasStoredChanges = false,
  editModeInvoice,
  hideHeader = false,
  hideNotices = false,
}: RegisteredTeamsSectionProps) {
  return (
    <motion.div className="w-full" variants={fadeInUp}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {!hideHeader && (
            <>
              {!isEditMode && <div className="h-px w-full bg-border" />}
              <div className="flex items-center justify-between">
                <p className="heading-4">Registered Teams</p>
                {isEditMode ? (
                  // Edit mode: show Bulk Upload and Register Team buttons
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onBulkUpload}>
                      <UploadIcon className="size-4" />
                      Bulk Upload
                    </Button>
                    <Button size="sm" onClick={onRegisterTeam}>
                      <PlusIcon className="size-4" />
                      Register Team
                    </Button>
                  </div>
                ) : isLocked ? (
                  <span className="body-small inline-flex items-center gap-1.5 text-muted-foreground/50 cursor-not-allowed">
                    Edit Registration
                    <ArrowUpRightIcon className="size-3.5" aria-hidden />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onEditRegistration}
                    className="body-small inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    Edit Registration
                    <ArrowUpRightIcon className="size-3.5" aria-hidden />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Status notices */}
          {!hideNotices &&
            (isEditMode ? (
              // Edit mode notice
              <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
                You are editing your registration. Add or modify teams below,
                then changes will be reflected in a new invoice.
              </div>
            ) : hasStoredChanges && editModeInvoice?.hasChanges ? (
              // Stored changes notice (submitted changes persisted)
              <div className="flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2Icon className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Registration updated</p>
                    <p className="text-green-700 dark:text-green-300">
                      Your changes have been saved. The invoice below reflects
                      your updates.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onDiscardChanges}
                  className="text-xs font-medium text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100 underline"
                >
                  Discard
                </button>
              </div>
            ) : isLocked ? (
              <div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <LockIcon className="size-4 shrink-0 mt-0.5" />
                <p>
                  The registration deadline has passed. Changes can no longer be
                  made to teams.
                </p>
              </div>
            ) : registrationDeadlineLabel ? (
              <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Changes to your registration must be made before{" "}
                <span className="font-medium text-foreground">
                  {registrationDeadlineLabel}
                </span>
                . Any updates will be reflected in a new invoice.
              </div>
            ) : null)}
        </div>

        {/* Teams by division */}
        <div className="flex flex-col gap-6 min-w-0">
          {allDivisions.map((division) => {
            const teamsInDivision = teamsByDivision.get(division) ?? [];
            return (
              <div key={division} className="flex flex-col gap-3 min-w-0">
                <p className="label text-muted-foreground">{division}</p>
                {teamsInDivision.length > 0 ? (
                  <div className="flex flex-col gap-3 min-w-0">
                    {teamsInDivision.map((card) => (
                      <TeamCard
                        key={card.id}
                        team={card}
                        isEditMode={isEditMode}
                        onEdit={onEditTeam}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[88px] items-center justify-center rounded-sm border border-dashed border-border/60 bg-muted/10 px-5 py-4">
                    <p className="text-sm text-muted-foreground">
                      No team registered for this division
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
