"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";

import { fadeInUp, staggerSections } from "@/lib/animations";
import { useAuth } from "@/components/providers/AuthProvider";
import { Section } from "@/components/layout/Section";
import { OrganizerCard } from "@/components/features/clubs/OrganizerCard";
import { RegistrationSummaryCard } from "@/components/features/events/RegistrationSummaryCard";
import { EmptyStateButton } from "@/components/ui/EmptyStateButton";
import type { Event } from "@/types/events";
import type { BrandGradient } from "@/lib/gradients";

import {
  SectionWrapper,
  OverviewSection,
  DateTimeSection,
  LocationSection,
  TimelineSection,
  PricingSection,
  GallerySection,
  DocumentsSection,
  ResultsSection,
  type TimelinePhase,
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
  /** Callback to save section (required when editable=true) */
  onSave?: (updates: Partial<Event>) => Promise<void>;
  /** Hide registration sidebar and mobile footer */
  hideRegistration?: boolean;
  /** Show organizer card at top instead of in section */
  showOrganizerCardAtTop?: boolean;
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
    timelinePhases?: TimelinePhase[];
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
  onSave,
  hideRegistration = false,
  showOrganizerCardAtTop = false,
  displayProps = {},
}: UnifiedEventDetailBodyProps) {
  // Edit mode state
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);
  const [localDraft, setLocalDraft] = useState<Partial<Event>>({});
  const [isSaving, setIsSaving] = useState(false);

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
    timelinePhases = [],
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

  const handleSaveSection = useCallback(async () => {
    if (!onSave || !onUpdate) return;
    setIsSaving(true);
    try {
      onUpdate(localDraft);
      await onSave(localDraft);
      toast.success("Section saved");
      setEditingSection(null);
    } catch (error) {
      toast.error("Failed to save");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }, [localDraft, onUpdate, onSave]);

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
            showDivider
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
            emptyState={
              <EmptyStateButton
                title={OverviewSection.emptyTitle}
                description={OverviewSection.emptyDescription}
              />
            }
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
                  organizerGradient={organizerGradient}
                />
              }
              emptyState={
                <EmptyStateButton
                  title={PricingSection.emptyTitle}
                  description={PricingSection.emptyDescription}
                />
              }
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
            emptyState={
              <EmptyStateButton
                title={DateTimeSection.emptyTitle}
                description={DateTimeSection.emptyDescription}
              />
            }
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
            emptyState={
              <EmptyStateButton
                title={LocationSection.emptyTitle}
                description={LocationSection.emptyDescription}
              />
            }
          />

          {/* Registration Timeline Section (Editor only) */}
          {editable && (
            <SectionWrapper
              id="registration"
              title="Registration Timeline"
              showDivider
              isEditing={editingSection === "registration"}
              onStartEdit={() => handleStartEdit("registration")}
              onSave={handleSaveSection}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              hasData={TimelineSection.hasData(displayData)}
              viewContent={
                <TimelineSection
                  mode="view"
                  eventData={displayData}
                  organizerGradient={organizerGradient}
                  timelinePhases={timelinePhases}
                />
              }
              editContent={
                <TimelineSection
                  mode="edit"
                  eventData={localDraft}
                  onUpdate={updateLocalDraft}
                  organizerGradient={organizerGradient}
                />
              }
              emptyState={
                <EmptyStateButton
                  title={TimelineSection.emptyTitle}
                  description={TimelineSection.emptyDescription}
                />
              }
            />
          )}

          {/* Gallery Section */}
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
            emptyState={
              <EmptyStateButton
                title={GallerySection.emptyTitle}
                description={GallerySection.emptyDescription}
              />
            }
          />

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
          <SectionWrapper
            id="documents"
            title="Documents & Resources"
            showDivider
            isEditing={editingSection === "documents"}
            onStartEdit={
              editable ? () => handleStartEdit("documents") : undefined
            }
            onSave={handleSaveSection}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            hasData={DocumentsSection.hasData(displayData) || documents.length > 0}
            viewContent={
              <DocumentsSection
                mode="view"
                eventData={displayData}
                organizerGradient={organizerGradient}
                documents={documents}
              />
            }
            editContent={
              <DocumentsSection
                mode="edit"
                eventData={localDraft}
                onUpdate={updateLocalDraft}
                organizerGradient={organizerGradient}
              />
            }
            emptyState={
              <EmptyStateButton
                title={DocumentsSection.emptyTitle}
                description={DocumentsSection.emptyDescription}
              />
            }
          />

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
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="text-sm text-foreground">
              {registrationClosed
                ? "Registration has closed"
                : `Registration closes on ${new Date(registrationDeadlineISO).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </p>
            {registrationClosed ? (
              <Button size="sm" disabled>
                Closed
              </Button>
            ) : isOrganizer ? (
              <Button size="sm" disabled>
                Register
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href={`/events/${encodeURIComponent(event.id)}/register`}>
                  Register
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Spacer to prevent content from being hidden behind sticky footer */}
      {!hideRegistration && <div className="h-20 lg:hidden" />}
    </>
  );
}
