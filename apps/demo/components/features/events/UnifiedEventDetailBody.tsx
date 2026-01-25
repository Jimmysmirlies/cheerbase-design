"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/shadcn/button";

import { fadeInUp, staggerSections } from "@/lib/animations";
import { useAuth } from "@/components/providers/AuthProvider";
import { Section } from "@/components/layout/Section";
import { OrganizerCard } from "@/components/features/clubs/OrganizerCard";
import { RegistrationSummaryCard } from "@/components/features/events/RegistrationSummaryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Event } from "@/types/events";
import type { BrandGradient } from "@/lib/gradients";

import {
  SectionWrapper,
  OverviewSection,
  DateTimeSection,
  LocationSection,
  PricingSection,
  GallerySection,
  DocumentsSection,
  ResultsSection,
  type PricingRow,
  type ScheduleDayParts,
} from "./sections";

type SectionId =
  | "overview"
  | "date-time"
  | "location"
  | "registration"
  | "pricing"
  | "gallery"
  | "organizer"
  | "documents"
  | "results";

export type UnifiedEventDetailBodyProps = {
  /** Event data */
  eventData: Partial<Event>;
  /** Organizer gradient for styling */
  organizerGradient: BrandGradient;
  /** Organizer followers count (formatted) */
  organizerFollowers?: string;
  /** Organizer events count */
  organizerEventsCount?: number;
  /** Organizer hosting duration (formatted) */
  organizerHostingDuration?: string;
  /** Enable edit mode */
  editable?: boolean;
  /** Callback for data updates (required when editable=true) */
  onUpdate?: (updates: Partial<Event>) => void;
  /** Hide registration sidebar and mobile footer */
  hideRegistration?: boolean;
  /** Show organizer card at top instead of in section */
  showOrganizerCardAtTop?: boolean;
  /** Hide the top divider on the Overview section (e.g., for organizer pages where tabs provide separation) */
  hideOverviewDivider?: boolean;
  /** Hide the Gallery section (when gallery is handled externally, e.g., in EventEditor) */
  hideGallerySection?: boolean;
  /** Pre-computed display values */
  displayProps?: {
    galleryImages?: string[];
    eventDateParts?: {
      month: string;
      day: string;
      weekday: string;
      fullDate: string;
    };
    scheduleDays?: ScheduleDayParts[];
    venueName?: string;
    cityState?: string;
    registrationDeadlineISO?: string;
    registrationClosed?: boolean;
    pricingDeadlineLabel?: string;
    pricingRows?: PricingRow[];
    documents?: { name: string; description: string; href: string }[];
    earlyBirdEnabled?: boolean;
  };
};

export function UnifiedEventDetailBody({
  eventData,
  organizerGradient,
  organizerFollowers = "—",
  organizerEventsCount,
  organizerHostingDuration,
  editable = false,
  onUpdate,
  hideRegistration = false,
  showOrganizerCardAtTop = false,
  hideOverviewDivider = false,
  hideGallerySection = false,
  displayProps = {},
}: UnifiedEventDetailBodyProps) {
  // Edit mode state
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);
  const [localDraft, setLocalDraft] = useState<Partial<Event>>({});
  const [isSaving] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);

  // Check if user is an organizer (can't register for events)
  const { user, status } = useAuth();
  const isOrganizer = status === "authenticated" && user?.role === "organizer";

  // Extract display props with defaults
  const {
    galleryImages = [],
    eventDateParts = { month: "", day: "", weekday: "", fullDate: "" },
    scheduleDays = [],
    venueName = "",
    cityState = "",
    registrationDeadlineISO = "",
    registrationClosed = false,
    pricingDeadlineLabel = "",
    pricingRows = [],
    documents = [],
    earlyBirdEnabled = false,
  } = displayProps;

  // Edit mode handlers
  const handleStartEdit = useCallback(
    (section: SectionId) => {
      if (!editable) return;
      setLocalDraft(eventData);
      setEditingSection(section);
    },
    [editable, eventData],
  );

  const handleSaveSection = useCallback(() => {
    if (!onUpdate) return;
    // Only update in-memory state - actual save happens via "Save Draft" button
    onUpdate(localDraft);
    setEditingSection(null);
  }, [localDraft, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setLocalDraft({});
    setEditingSection(null);
  }, []);

  const updateLocalDraft = useCallback((updates: Partial<Event>) => {
    setLocalDraft((prev) => ({ ...prev, ...updates }));
  }, []);

  // Determine which data to use (draft when editing, eventData otherwise)
  const displayData = editingSection ? localDraft : eventData;

  // Build event object for display
  const event = {
    id: eventData.id || "",
    name: eventData.name || "",
    date: eventData.date || "",
    description: eventData.description || "",
    organizer: eventData.organizer || "",
    location: eventData.location || "",
  };

  return (
    <>
      <div
        className={`grid gap-10 ${hideRegistration ? "" : "lg:grid-cols-[1fr_320px]"}`}
      >
        <motion.article
          className="min-w-0 overflow-hidden"
          variants={staggerSections}
          initial="hidden"
          animate="visible"
        >
          {/* Overview Section */}
          <SectionWrapper
            id="overview"
            title="Overview"
            showDivider={!hideOverviewDivider}
            isEditing={editingSection === "overview"}
            onStartEdit={
              editable ? () => handleStartEdit("overview") : undefined
            }
            onSave={handleSaveSection}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            hasData={OverviewSection.hasData(displayData)}
            viewContent={
              <OverviewSection
                mode="view"
                eventData={displayData}
                organizerGradient={organizerGradient}
              />
            }
            editContent={
              <OverviewSection
                mode="edit"
                eventData={localDraft}
                onUpdate={updateLocalDraft}
                organizerGradient={organizerGradient}
              />
            }
            emptyState={<EmptyState>{OverviewSection.emptyTitle}</EmptyState>}
          />

          {/* Registration & Pricing Section (Combined for view mode) */}
          {!editable && (
            <motion.div variants={fadeInUp}>
              <Section
                id="registration-pricing"
                title="Registration & Pricing"
                titleRight={
                  earlyBirdEnabled ? (
                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                      Early bird ends {pricingDeadlineLabel}
                    </span>
                  ) : undefined
                }
              >
                <PricingSection
                  mode="view"
                  eventData={displayData}
                  organizerGradient={organizerGradient}
                  pricingRows={pricingRows}
                  pricingDeadlineLabel={pricingDeadlineLabel}
                />
              </Section>
            </motion.div>
          )}

          {/* Pricing Section (Separate for edit mode) */}
          {editable && (
            <SectionWrapper
              id="pricing"
              title="Pricing"
              showDivider
              isEditing={editingSection === "pricing"}
              onStartEdit={() => handleStartEdit("pricing")}
              onSave={handleSaveSection}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              hasData={PricingSection.hasData(displayData)}
              viewContent={
                <PricingSection
                  mode="view"
                  eventData={displayData}
                  organizerGradient={organizerGradient}
                  pricingRows={pricingRows}
                  pricingDeadlineLabel={pricingDeadlineLabel}
                />
              }
              editContent={
                <PricingSection
                  mode="edit"
                  eventData={localDraft}
                  onUpdate={updateLocalDraft}
                  onCloseEdit={handleCancelEdit}
                  organizerGradient={organizerGradient}
                />
              }
              emptyState={<EmptyState>{PricingSection.emptyTitle}</EmptyState>}
            />
          )}

          {/* Event Date & Time Section */}
          <SectionWrapper
            id="date-time"
            title={
              scheduleDays.length > 1 ? "Event Schedule" : "Event Date & Time"
            }
            showDivider
            isEditing={editingSection === "date-time"}
            onStartEdit={
              editable ? () => handleStartEdit("date-time") : undefined
            }
            onSave={handleSaveSection}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            hasData={DateTimeSection.hasData(displayData)}
            viewContent={
              <DateTimeSection
                mode="view"
                eventData={displayData}
                organizerGradient={organizerGradient}
                eventDateParts={eventDateParts}
                scheduleDays={scheduleDays}
              />
            }
            editContent={
              <DateTimeSection
                mode="edit"
                eventData={localDraft}
                onUpdate={updateLocalDraft}
                organizerGradient={organizerGradient}
              />
            }
            emptyState={<EmptyState>{DateTimeSection.emptyTitle}</EmptyState>}
          />

          {/* Location Section */}
          <SectionWrapper
            id="location"
            title="Where You'll Be"
            showDivider
            isEditing={editingSection === "location"}
            onStartEdit={
              editable ? () => handleStartEdit("location") : undefined
            }
            onSave={handleSaveSection}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            hasData={LocationSection.hasData(displayData)}
            viewContent={
              <LocationSection
                mode="view"
                eventData={displayData}
                organizerGradient={organizerGradient}
                venueName={venueName}
                cityState={cityState}
              />
            }
            editContent={
              <LocationSection
                mode="edit"
                eventData={localDraft}
                onUpdate={updateLocalDraft}
                organizerGradient={organizerGradient}
              />
            }
            emptyState={<EmptyState>{LocationSection.emptyTitle}</EmptyState>}
          />

          {/* Gallery Section - hidden when handled externally (e.g., EventEditor) */}
          {!hideGallerySection && (
            <SectionWrapper
              id="gallery"
              title="Gallery"
              showDivider
              isEditing={editingSection === "gallery"}
              onStartEdit={
                editable ? () => handleStartEdit("gallery") : undefined
              }
              onSave={handleSaveSection}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              hasData={
                GallerySection.hasData(displayData) || galleryImages.length > 0
              }
              viewContent={
                <GallerySection
                  mode="view"
                  eventData={displayData}
                  organizerGradient={organizerGradient}
                  galleryImages={galleryImages}
                />
              }
              editContent={
                <GallerySection
                  mode="edit"
                  eventData={localDraft}
                  onUpdate={updateLocalDraft}
                  organizerGradient={organizerGradient}
                />
              }
              emptyState={<EmptyState>{GallerySection.emptyTitle}</EmptyState>}
            />
          )}

          {/* Organizer Section - hidden when shown at top */}
          {!showOrganizerCardAtTop && (
            <motion.div variants={fadeInUp}>
              <Section id="organizer" title="Organizer" showDivider>
                <OrganizerCard
                  name={event.organizer}
                  gradient={organizerGradient}
                  followers={organizerFollowers}
                  eventsCount={organizerEventsCount}
                  hostingDuration={organizerHostingDuration}
                />
              </Section>
            </motion.div>
          )}

          {/* Documents Section */}
          {(DocumentsSection.hasData(displayData) ||
            documents.length > 0 ||
            editable) && (
            <motion.div variants={fadeInUp}>
              <Section
                id="documents"
                title="Documents & Resources"
                showDivider
                titleRight={
                  editable ? (
                    <button
                      type="button"
                      onClick={() => setDocModalOpen(true)}
                      className="text-sm text-foreground underline hover:no-underline"
                    >
                      Add Document
                    </button>
                  ) : undefined
                }
              >
                <DocumentsSection
                  eventData={editable ? localDraft : displayData}
                  documents={editable ? undefined : documents}
                  editable={editable}
                  onUpdate={editable ? updateLocalDraft : undefined}
                  modalOpen={docModalOpen}
                  onModalOpenChange={setDocModalOpen}
                />
              </Section>
            </motion.div>
          )}

          {/* Results Section - Not editable */}
          <motion.div variants={fadeInUp}>
            <Section id="results" title="Results & Leaderboard" showDivider>
              <ResultsSection mode="view" eventData={displayData} />
            </Section>
          </motion.div>
        </motion.article>

        {/* Sidebar with Registration CTA (desktop) - hidden for organizer views */}
        {!hideRegistration && (
          <motion.div
            className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <RegistrationSummaryCard
              eventId={event.id}
              eventDate={event.date}
              eventStartTime="9:00 AM"
              registrationDeadline={registrationDeadlineISO}
              isRegistrationClosed={registrationClosed}
              hidePricingButton
            />
          </motion.div>
        )}
      </div>

      {/* Mobile Sticky Footer CTA */}
      {!hideRegistration && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-sm lg:hidden pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="body-small font-medium text-foreground truncate">
                {registrationClosed
                  ? "Registration Has Closed"
                  : "Registration Open"}
              </p>
              {!registrationClosed && (
                <p className="body-small text-muted-foreground truncate">
                  Closes{" "}
                  {new Date(registrationDeadlineISO).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </p>
              )}
            </div>
            {registrationClosed ? (
              <Button size="lg" disabled className="shrink-0">
                Closed
              </Button>
            ) : isOrganizer ? (
              <Button size="lg" disabled className="shrink-0">
                Register
              </Button>
            ) : (
              <Button asChild size="lg" className="shrink-0">
                <Link href={`/events/${encodeURIComponent(event.id)}/register`}>
                  Register Now
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      {!hideRegistration && (
        <div
          className="h-24 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        />
      )}
    </>
  );
}
