"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/shadcn/button";

import { PageHeader } from "@/components/layout/PageHeader";
import { LayoutToggle } from "@/components/ui/LayoutToggle";
import { staggerSections, fadeInUp } from "@/lib/animations";
import { RegistrationPaymentCTA } from "@/components/features/clubs/RegistrationPaymentCTA";
import { EditRegistrationDialog } from "@/components/features/clubs/EditRegistrationDialog";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RegisterTeamModal } from "@/components/features/registration/flow/RegisterTeamModal";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import type { TeamData } from "@/components/features/clubs/TeamCard";

import { EventDetailsSection } from "./EventDetailsSection";
import { DocumentsSection } from "./DocumentsSection";
import { RegisteredTeamsSection } from "./RegisteredTeamsSection";
import { InvoiceSidebar, EditModeInvoiceSidebar } from "./InvoiceSidebar";
import { MobileStickyBar, EditModeMobileStickyBar } from "./MobileStickyBar";
import { useRegistrationEdit } from "./useRegistrationEdit";
import type {
  RegistrationDetailContentProps,
  LayoutVariant,
  RegisteredTeamData,
} from "./types";
import { LAYOUT_TUTORIAL_STORAGE_KEY, LAYOUT_TUTORIAL_ITEMS } from "./types";

export function RegistrationDetailContent({
  registration,
  organizerName,
  organizerGradientVariant,
  organizerFollowersLabel,
  organizerEventsCount,
  organizerHostingLabel,
  locationLabel,
  googleMapsHref,
  eventDateLabel,
  eventDateWeekday,
  registrationDeadlineLabel,
  isLocked,
  allDivisions,
  teamsByDivisionArray,
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceTotalLabel,
  invoiceNumber,
  invoiceDate,
  invoiceHref,
  eventPageHref,
  paymentStatus,
  paymentDeadlineLabel,
  paymentTitle,
  paidAtLabel,
  dueDateMonth,
  dueDateDay,
  isEditMode = false,
  divisionPricing = [],
  teamOptions = [],
  teamRosters = [],
  documents = [],
}: RegistrationDetailContentProps) {
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("A");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [registerTeamOpen, setRegisterTeamOpen] = useState(false);
  const [rosterEditorOpen, setRosterEditorOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] =
    useState<RegisteredTeamData | null>(null);

  const {
    addedTeams,
    removedTeamIds,
    teamsByDivision,
    editModeInvoice,
    savedChanges,
    handleBulkImport,
    handleRegisterTeam,
    handleRemoveTeam,
    handleSaveRoster,
    handleSubmitRegistration,
    handleDiscardChanges,
    getTeamMembersForEditor,
  } = useRegistrationEdit({
    registrationId: registration.id,
    isEditMode,
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
  });

  const handleEditTeam = (team: TeamData) => {
    setSelectedTeamForEdit(team as RegisteredTeamData);
    setRosterEditorOpen(true);
  };

  const selectedTeamMembers = getTeamMembersForEditor(selectedTeamForEdit);

  // Check if we have stored changes that should be shown as an updated invoice
  const showUpdatedInvoice =
    !isEditMode && !!savedChanges && editModeInvoice.hasChanges;

  // Calculate refund amount if new total is less than original
  const refundAmount =
    showUpdatedInvoice && savedChanges?.originalInvoice
      ? savedChanges.originalInvoice.total - editModeInvoice.total
      : 0;

  // Common event details props
  const eventDetailsProps = {
    organizerName,
    organizerGradientVariant,
    organizerFollowersLabel,
    organizerEventsCount,
    organizerHostingLabel,
    locationLabel,
    googleMapsHref,
    eventDateLabel,
    eventDateWeekday,
    eventPageHref,
  };

  // Edit mode layout
  if (isEditMode) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader
          title={`Edit Registration: ${registration.eventName}`}
          gradient={organizerGradientVariant}
          breadcrumbs={[
            { label: "Clubs", href: "/clubs" },
            { label: "Registrations", href: "/clubs/registrations" },
            {
              label: registration.eventName,
              href: `/clubs/registrations/${registration.id}`,
            },
            { label: "Edit" },
          ]}
        />

        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
            <motion.div
              className="space-y-8 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <RegisteredTeamsSection
                allDivisions={allDivisions}
                teamsByDivision={teamsByDivision}
                isEditMode={isEditMode}
                isLocked={isLocked}
                registrationDeadlineLabel={registrationDeadlineLabel}
                onBulkUpload={() => setBulkUploadOpen(true)}
                onRegisterTeam={() => setRegisterTeamOpen(true)}
                onEditTeam={handleEditTeam}
              />
            </motion.div>
            <EditModeInvoiceSidebar
              editModeInvoice={editModeInvoice}
              onSubmit={handleSubmitRegistration}
              onCancel={handleDiscardChanges}
            />
          </div>
        </div>

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
          divisionPricing={divisionPricing}
          teamOptions={teamOptions}
          onImport={(entries) => {
            const success = handleBulkImport(entries);
            if (success) setBulkUploadOpen(false);
          }}
        />
        <RegisterTeamModal
          open={registerTeamOpen}
          onOpenChange={setRegisterTeamOpen}
          divisions={allDivisions}
          teams={teamOptions}
          onSubmit={(entry) => {
            const success = handleRegisterTeam(entry);
            if (success) setRegisterTeamOpen(false);
          }}
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
      </section>
    );
  }

  // View mode layouts
  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title={registration.eventName}
        gradient={organizerGradientVariant}
        dateLabel={eventDateLabel}
        topRightAction={
          <LayoutToggle
            variants={["A", "B", "C"] as const}
            value={layoutVariant}
            onChange={setLayoutVariant}
            storageKey={LAYOUT_TUTORIAL_STORAGE_KEY}
            tutorialItems={LAYOUT_TUTORIAL_ITEMS}
          />
        }
      />

      {layoutVariant === "A" ? (
        // LAYOUT A: Two-column with CTA sidebar
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
              <motion.div
                className="space-y-12 min-w-0"
                variants={staggerSections}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <EventDetailsSection {...eventDetailsProps} />
                <DocumentsSection documents={documents} />
                <RegisteredTeamsSection
                  allDivisions={allDivisions}
                  teamsByDivision={teamsByDivision}
                  isEditMode={false}
                  isLocked={isLocked}
                  registrationDeadlineLabel={registrationDeadlineLabel}
                  onEditRegistration={() => setEditDialogOpen(true)}
                  hasStoredChanges={!!savedChanges}
                  editModeInvoice={editModeInvoice}
                  onDiscardChanges={handleDiscardChanges}
                />
              </motion.div>
              <InvoiceSidebar
                invoiceLineItems={invoiceLineItems}
                subtotal={subtotal}
                totalTax={totalTax}
                invoiceTotal={invoiceTotal}
                invoiceHref={invoiceHref}
                paymentStatus={paymentStatus}
                paymentDeadlineLabel={paymentDeadlineLabel}
                paidAtLabel={paidAtLabel}
                showUpdatedInvoice={showUpdatedInvoice}
                editModeInvoice={editModeInvoice}
                refundAmount={refundAmount}
              />
            </div>
          </div>
          <MobileStickyBar
            paymentStatus={paymentStatus}
            paymentTitle={paymentTitle}
            paymentDeadlineLabel={paymentDeadlineLabel}
            paidAtLabel={paidAtLabel}
            dueDateMonth={dueDateMonth}
            dueDateDay={dueDateDay}
            invoiceHref={invoiceHref}
          />
        </>
      ) : layoutVariant === "B" ? (
        // LAYOUT B: Single column with top payment notice + buttons
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            <motion.div
              className="mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <RegistrationPaymentCTA
                status={
                  paymentStatus.toLowerCase() as "paid" | "unpaid" | "overdue"
                }
                amountLabel={invoiceTotalLabel}
                dueLabel={paymentDeadlineLabel}
                paidAtLabel={paidAtLabel ?? undefined}
                invoiceHref={invoiceHref}
              />
            </motion.div>

            <motion.div
              className="space-y-12 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <EventDetailsSection {...eventDetailsProps} showDivider />
              <DocumentsSection documents={documents} />
              <RegisteredTeamsSection
                allDivisions={allDivisions}
                teamsByDivision={teamsByDivision}
                isEditMode={false}
                isLocked={isLocked}
                registrationDeadlineLabel={registrationDeadlineLabel}
                onEditRegistration={() => setEditDialogOpen(true)}
                hasStoredChanges={!!savedChanges}
                editModeInvoice={editModeInvoice}
                onDiscardChanges={handleDiscardChanges}
              />
            </motion.div>
          </div>
          <MobileStickyBar
            paymentStatus={paymentStatus}
            paymentTitle={paymentTitle}
            paymentDeadlineLabel={paymentDeadlineLabel}
            paidAtLabel={paidAtLabel}
            dueDateMonth={dueDateMonth}
            dueDateDay={dueDateDay}
            invoiceHref={invoiceHref}
          />
        </>
      ) : (
        // LAYOUT C: Single column with quick action row + simple notice
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            <motion.div
              className="mb-4 flex flex-wrap items-center gap-2"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button asChild variant="outline" size="sm">
                <Link href={invoiceHref}>View Invoice</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={eventPageHref}>View Event Listing</Link>
              </Button>
              {isLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  Edit Registration
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit Registration
                </Button>
              )}
            </motion.div>

            <motion.div
              className="mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <RegistrationPaymentCTA
                status={
                  paymentStatus.toLowerCase() as "paid" | "unpaid" | "overdue"
                }
                amountLabel={invoiceTotalLabel}
                dueLabel={paymentDeadlineLabel}
                paidAtLabel={paidAtLabel ?? undefined}
                invoiceHref={invoiceHref}
                hideButtons
              />
            </motion.div>

            <motion.div
              className="space-y-12 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <EventDetailsSection {...eventDetailsProps} showDivider />
              <DocumentsSection documents={documents} />
              <RegisteredTeamsSection
                allDivisions={allDivisions}
                teamsByDivision={teamsByDivision}
                isEditMode={false}
                isLocked={isLocked}
                registrationDeadlineLabel={registrationDeadlineLabel}
                onEditRegistration={() => setEditDialogOpen(true)}
                hasStoredChanges={!!savedChanges}
                editModeInvoice={editModeInvoice}
                onDiscardChanges={handleDiscardChanges}
              />
            </motion.div>
          </div>
        </>
      )}

      <EditRegistrationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        registrationId={registration.id}
      />
    </section>
  );
}
