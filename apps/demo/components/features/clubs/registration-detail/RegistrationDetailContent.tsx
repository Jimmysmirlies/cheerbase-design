"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPinIcon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";

import { PageHeader } from "@/components/layout/PageHeader";
import { ActionBar, type ActionBarTab } from "@/components/layout/ActionBar";
import { staggerSections } from "@/lib/animations";
import { EditRegistrationDialog } from "@/components/features/clubs/EditRegistrationDialog";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RegisterTeamModal } from "@/components/features/registration/flow/RegisterTeamModal";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import type { TeamData } from "@/components/features/clubs/TeamCard";

import { EventPageTabContent } from "./EventPageTabContent";
import { RegisteredTeamsSection } from "./RegisteredTeamsSection";
import { EditModeInvoiceSidebar } from "./InvoiceSidebar";
import { MobileStickyBar, EditModeMobileStickyBar } from "./MobileStickyBar";
import { useRegistrationEdit } from "./useRegistrationEdit";
import type {
  RegistrationDetailContentProps,
  RegistrationTabId,
  RegisteredTeamData,
} from "./types";

export function RegistrationDetailContent({
  registration,
  organizerName,
  organizerGradientVariant,
  organizerFollowersLabel: _organizerFollowersLabel,
  organizerEventsCount,
  organizerHostingLabel,
  locationLabel,
  googleMapsHref: _googleMapsHref,
  eventDateLabel: _eventDateLabel,
  eventDateWeekday: _eventDateWeekday,
  registrationDeadlineLabel,
  isLocked,
  allDivisions,
  teamsByDivisionArray,
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceTotalLabel: _invoiceTotalLabel,
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
  eventDescription,
  galleryImages = [],
  pricingRows: _pricingRows = [],
  eventDate,
  eventStartTime,
  eventEndTime,
  eventTimezone,
  organizerRegion,
}: RegistrationDetailContentProps) {
  const searchParams = useSearchParams();

  // Tab state from URL
  const tabFromUrl = searchParams.get("tab");
  const validTab: RegistrationTabId =
    tabFromUrl === "registered-teams" ? tabFromUrl : "event-page";
  const [activeTab, setActiveTab] = useState<RegistrationTabId>(validTab);

  // Sync tab state with URL changes
  useEffect(() => {
    setActiveTab(validTab);
  }, [validTab]);

  // Dialog states
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

  // Count teams for tab badge
  const totalTeams = useMemo(() => {
    return teamsByDivisionArray.reduce((sum, [, teams]) => sum + teams.length, 0);
  }, [teamsByDivisionArray]);

  // Tabs with count badge
  const tabsWithCount: ActionBarTab[] = useMemo(
    () => [
      { id: "event-page", label: "Event Page" },
      { id: "registered-teams", label: "Registered Teams", count: totalTeams },
    ],
    [totalTeams],
  );

  // Edit mode layout (unchanged)
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

        <div className="mx-auto w-full max-w-6xl px-4 lg:px-8 py-8 min-w-0">
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

  // View mode with tabs
  return (
    <section className="flex flex-1 flex-col">
      {/* Tab navigation */}
      <div className="mx-auto w-full max-w-6xl">
        <ActionBar
          tabs={tabsWithCount}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as RegistrationTabId)}
          variant="unstyled"
        />
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-6xl pb-8">
        {activeTab === "event-page" ? (
          <EventPageTabContent
            eventName={registration.eventName}
            eventDescription={eventDescription}
            organizerName={organizerName}
            locationLabel={locationLabel}
            eventPageHref={eventPageHref}
            galleryImages={galleryImages}
            divisionPricing={divisionPricing}
            documents={documents}
            invoiceLineItems={invoiceLineItems}
            subtotal={subtotal}
            totalTax={totalTax}
            invoiceTotal={invoiceTotal}
            invoiceHref={invoiceHref}
            paymentStatus={paymentStatus}
            paymentDeadlineLabel={paymentDeadlineLabel}
            paidAtLabel={paidAtLabel}
            organizerGradient={organizerGradientVariant}
            eventDate={eventDate}
            eventStartTime={eventStartTime}
            eventEndTime={eventEndTime}
            eventTimezone={eventTimezone}
            organizerRegion={organizerRegion}
            organizerEventsCount={organizerEventsCount}
            organizerHostingLabel={organizerHostingLabel}
            onEditRegistration={() => setEditDialogOpen(true)}
            isLocked={isLocked}
          />
        ) : (
          <div className="pt-8">
            <motion.div
              className="space-y-6 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Event header with Edit Registration button */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="heading-2 mb-2">{registration.eventName}</h1>
                  <p className="body-text mb-3">
                    Hosted by{" "}
                    <Link
                      href={eventPageHref}
                      className="text-primary hover:underline"
                    >
                      {organizerName}
                    </Link>
                  </p>
                  {locationLabel && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="body-small flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <MapPinIcon className="size-4 shrink-0" />
                      <span className="underline">{locationLabel}</span>
                    </a>
                  )}
                </div>
                {isLocked ? (
                  <Button variant="outline" disabled className="opacity-50 shrink-0">
                    Edit Registration
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Edit Registration
                  </Button>
                )}
              </div>

              {/* Registration deadline notice */}
              {isLocked ? (
                <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  The registration deadline has passed. Changes can no longer be
                  made to teams.
                </div>
              ) : registrationDeadlineLabel ? (
                <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  Changes to your registration must be made before{" "}
                  <span className="font-medium text-foreground">
                    {registrationDeadlineLabel}
                  </span>
                  . Any updates will be reflected in a new invoice.
                </div>
              ) : null}

              <RegisteredTeamsSection
                allDivisions={allDivisions}
                teamsByDivision={teamsByDivision}
                isEditMode={false}
                isLocked={isLocked}
                registrationDeadlineLabel={registrationDeadlineLabel}
                hasStoredChanges={!!savedChanges}
                editModeInvoice={editModeInvoice}
                onDiscardChanges={handleDiscardChanges}
                hideHeader
                hideNotices
              />
            </motion.div>
          </div>
        )}
      </div>

      {/* Mobile sticky bar - different for each tab */}
      {activeTab === "event-page" ? (
        <MobileStickyBar
          paymentStatus={paymentStatus}
          paymentTitle={paymentTitle}
          paymentDeadlineLabel={paymentDeadlineLabel}
          paidAtLabel={paidAtLabel}
          dueDateMonth={dueDateMonth}
          dueDateDay={dueDateDay}
          invoiceHref={invoiceHref}
        />
      ) : (
        <MobileStickyBar
          paymentStatus={paymentStatus}
          paymentTitle={paymentTitle}
          paymentDeadlineLabel={paymentDeadlineLabel}
          paidAtLabel={paidAtLabel}
          dueDateMonth={dueDateMonth}
          dueDateDay={dueDateDay}
          invoiceHref={invoiceHref}
          showEditButton={!isLocked}
          onEditRegistration={() => setEditDialogOpen(true)}
        />
      )}

      <EditRegistrationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        registrationId={registration.id}
      />
    </section>
  );
}
