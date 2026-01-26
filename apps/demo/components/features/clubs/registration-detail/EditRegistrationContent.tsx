"use client";

/**
 * EditRegistrationContent
 *
 * Presentational component for editing an existing registration in focus mode.
 * Mirrors the NewRegistrationContent layout with two-column grid:
 * - Left: Teams section with division groupings
 * - Right: Invoice summary sidebar with submit/cancel
 * - Mobile: Sticky footer with submit CTA
 */

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusIcon, UploadIcon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";

import { fadeInUp } from "@/lib/animations";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RegisterTeamModal } from "@/components/features/registration/flow/RegisterTeamModal";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import type { TeamData } from "@/components/features/clubs/TeamCard";
import type { DivisionPricing } from "@/types/events";

import { RegisteredTeamsSection } from "./RegisteredTeamsSection";
import { EditModeInvoiceSidebar } from "./InvoiceSidebar";
import { EditModeMobileStickyBar } from "./MobileStickyBar";
import { useRegistrationEdit } from "./useRegistrationEdit";
import {
  RegistrationChangeHistoryBar,
  type RegistrationChange,
} from "./RegistrationChangeHistoryBar";
import type {
  RegisteredTeamData,
  InvoiceLineItem,
  DivisionPricingProp,
  TeamOption,
  TeamRosterData,
} from "./types";

export type EditRegistrationContentProps = {
  registrationId: string;
  eventName: string;
  allDivisions: string[];
  teamsByDivisionArray: [string, RegisteredTeamData[]][];
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceNumber: string;
  invoiceDate: string;
  divisionPricing: DivisionPricingProp[] | DivisionPricing[];
  teamOptions: TeamOption[];
  teamRosters: TeamRosterData[];
  registrationDeadlineLabel: string | null;
  isLocked: boolean;
  /** Called when user attempts to leave with unsaved changes */
  onUnsavedChangesBack?: (hasChanges: boolean) => void;
};

export function EditRegistrationContent({
  registrationId,
  eventName: _eventName,
  allDivisions,
  teamsByDivisionArray,
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceNumber,
  invoiceDate,
  divisionPricing,
  teamOptions,
  teamRosters,
  registrationDeadlineLabel,
  isLocked,
  onUnsavedChangesBack,
}: EditRegistrationContentProps) {
  // Dialog states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [registerTeamOpen, setRegisterTeamOpen] = useState(false);
  const [rosterEditorOpen, setRosterEditorOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] =
    useState<RegisteredTeamData | null>(null);

  // Normalize division pricing to DivisionPricingProp format
  const normalizedDivisionPricing: DivisionPricingProp[] = divisionPricing.map(
    (d) => ({
      name: d.name,
      earlyBird: d.earlyBird,
      regular: d.regular ?? { price: 0 },
    }),
  );

  // Use the registration edit hook
  const {
    addedTeams,
    removedTeamIds,
    memberChanges,
    teamsByDivision,
    editModeInvoice,
    handleBulkImport,
    handleRegisterTeam,
    handleRemoveTeam,
    handleSaveRoster,
    handleSubmitRegistration,
    handleDiscardChanges,
    getTeamMembersForEditor,
  } = useRegistrationEdit({
    registrationId,
    isEditMode: true,
    teamsByDivisionArray,
    invoiceLineItems,
    subtotal,
    totalTax,
    invoiceTotal,
    invoiceNumber,
    invoiceDate,
    divisionPricing: normalizedDivisionPricing,
    teamOptions,
    teamRosters,
  });

  // Build change log for history bar
  const changeLog: RegistrationChange[] = useMemo(() => {
    const changes: RegistrationChange[] = [];

    // Added teams
    addedTeams.forEach((team) => {
      changes.push({
        id: `added-${team.id}`,
        type: "added",
        description: `${team.name} added to ${team.division}`,
      });
    });

    // Removed teams - find names from original data
    const originalTeamsMap = new Map<string, RegisteredTeamData>();
    teamsByDivisionArray.forEach(([, teams]) => {
      teams.forEach((team) => {
        originalTeamsMap.set(team.id, team);
      });
    });

    removedTeamIds.forEach((teamId) => {
      const team = originalTeamsMap.get(teamId);
      changes.push({
        id: `removed-${teamId}`,
        type: "removed",
        description: team
          ? `${team.name} removed from ${team.division}`
          : `Team removed`,
      });
    });

    // Member-level changes (additions/removals from rosters)
    memberChanges.forEach((change) => {
      if (change.type === "member-removed") {
        changes.push({
          id: change.id,
          type: "modified",
          description: `${change.memberName} was removed from ${change.teamName} roster (${change.previousCount} → ${change.newCount} members)`,
        });
      } else if (change.type === "member-added") {
        changes.push({
          id: change.id,
          type: "modified",
          description: `${change.memberName} was added to ${change.teamName} roster (${change.previousCount} → ${change.newCount} members)`,
        });
      }
    });

    return changes;
  }, [addedTeams, removedTeamIds, memberChanges, teamsByDivisionArray]);

  // Notify parent about changes when back is attempted
  const hasChanges = editModeInvoice.hasChanges;

  // Notify parent of hasChanges state via callback
  useEffect(() => {
    if (onUnsavedChangesBack) {
      onUnsavedChangesBack(hasChanges);
    }
  }, [hasChanges, onUnsavedChangesBack]);

  // Handle team edit (open roster editor)
  const handleEditTeam = (team: TeamData) => {
    setSelectedTeamForEdit(team as RegisteredTeamData);
    setRosterEditorOpen(true);
  };

  // Get selected team members for editor
  const selectedTeamMembers = getTeamMembersForEditor(selectedTeamForEdit);

  return (
    <>
      <div className="min-w-0 space-y-6">
        {/* Action bar with title and buttons */}
        <div className="flex w-full items-center justify-between gap-4 border-b border-border/60 pb-4">
          <h2 className="heading-4">Edit Teams</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
              <UploadIcon className="size-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setRegisterTeamOpen(true)}>
              <PlusIcon className="size-4" />
              Add Team
            </Button>
          </div>
        </div>

        {/* Change history bar - shows when there are changes */}
        <RegistrationChangeHistoryBar
          changes={changeLog}
          onDiscard={handleDiscardChanges}
        />

        {/* Two-column layout matching NewRegistrationContent */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
          {/* Left column: Teams section */}
          <motion.div
            className="space-y-8 min-w-0"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <RegisteredTeamsSection
              allDivisions={allDivisions}
              teamsByDivision={teamsByDivision}
              isEditMode={true}
              isLocked={isLocked}
              registrationDeadlineLabel={registrationDeadlineLabel}
              onEditTeam={handleEditTeam}
              editModeInvoice={editModeInvoice}
              hideHeader={true}
              hideNotices={true}
            />
          </motion.div>

          {/* Right column: Invoice sidebar */}
          <EditModeInvoiceSidebar
            editModeInvoice={editModeInvoice}
            onSubmit={handleSubmitRegistration}
            onCancel={handleDiscardChanges}
          />
        </div>
      </div>

      {/* Mobile sticky footer */}
      <EditModeMobileStickyBar
        editModeInvoice={editModeInvoice}
        addedTeamsCount={addedTeams.length}
        removedTeamsCount={removedTeamIds.size}
        onSubmit={handleSubmitRegistration}
      />

      {/* Dialogs */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        divisionPricing={divisionPricing as DivisionPricing[]}
        teamOptions={teamOptions}
        onImport={handleBulkImport}
      />
      <RegisterTeamModal
        open={registerTeamOpen}
        onOpenChange={setRegisterTeamOpen}
        divisions={allDivisions}
        teams={teamOptions}
        onSubmit={handleRegisterTeam}
      />
      <RosterEditorDialog
        open={rosterEditorOpen}
        onOpenChange={(open) => {
          setRosterEditorOpen(open);
          if (!open) setSelectedTeamForEdit(null);
        }}
        members={selectedTeamMembers}
        teamName={selectedTeamForEdit?.name ?? "Team"}
        onSave={(members) => {
          if (selectedTeamForEdit) {
            handleSaveRoster(selectedTeamForEdit, members);
          }
          setRosterEditorOpen(false);
          setSelectedTeamForEdit(null);
        }}
        onDeleteTeam={
          selectedTeamForEdit
            ? () => handleRemoveTeam(selectedTeamForEdit.id)
            : undefined
        }
      />
    </>
  );
}
