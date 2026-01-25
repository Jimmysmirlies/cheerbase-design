"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/shadcn/sheet";
import { toast } from "@workspace/ui/shadcn/sonner";
import { useEventEditor } from "@/components/providers/EventEditorProvider";
import { useFocusModeSettings } from "@/hooks/useFocusModeSettings";
import { useEventDisplayProps } from "@/hooks/useEventDisplayProps";
import { UnifiedEventDetailBody } from "@/components/features/events/UnifiedEventDetailBody";
import { FocusModeHeader } from "@/components/layout/FocusModeHeader";
import { EditorActionBar } from "./EditorActionBar";
import { EditableGallerySection } from "./EditableGallerySection";
import { EditableEventTitleSection } from "./EditableEventTitleSection";
import { EventSettingsSidebar } from "./EventSettingsSidebar";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { ChangeHistoryBar } from "./ChangeHistoryBar";

export function EventEditor() {
  const router = useRouter();
  const {
    eventData,
    updateEventData,
    saveSection,
    publishEvent,
    discardChanges,
    organizerGradient,
    isPublished,
    isPublishing,
    isDirty,
    changeLog,
  } = useEventEditor();

  const { sidebarOpen, toggleSidebar, isHydrated, MOBILE_SHEET_EVENT } =
    useFocusModeSettings();

  // Compute display props for WYSIWYG preview
  const displayProps = useEventDisplayProps(eventData, organizerGradient);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Listen for mobile sheet open requests from other components
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMobileSheetRequest = () => {
      if (isMobile) {
        setMobileSheetOpen(true);
      }
    };

    window.addEventListener(MOBILE_SHEET_EVENT, handleMobileSheetRequest);
    return () =>
      window.removeEventListener(MOBILE_SHEET_EVENT, handleMobileSheetRequest);
  }, [isMobile, MOBILE_SHEET_EVENT]);

  const handlePublish = useCallback(() => {
    publishEvent();
  }, [publishEvent]);

  // Handle back button - intercept if there are unsaved changes
  const handleBack = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      router.push("/organizer/events");
    }
  }, [isDirty, router]);

  // Save draft (stays on page)
  const handleSaveDraftInline = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await saveSection(eventData);
      toast.success("Draft saved");
    } catch (error) {
      toast.error("Failed to save draft");
      console.error(error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [eventData, saveSection]);

  // Save draft and navigate back (from modal)
  const handleSaveDraftAndBack = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      await saveSection(eventData);
      toast.success("Draft saved");
      router.push("/organizer/events");
    } catch (error) {
      toast.error("Failed to save draft");
      console.error(error);
    } finally {
      setIsSavingDraft(false);
      setShowUnsavedModal(false);
    }
  }, [eventData, saveSection, router]);

  // Discard changes and navigate back
  const handleDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    router.push("/organizer/events");
  }, [router]);

  // Open mobile settings sheet
  const handleOpenMobileSettings = useCallback(() => {
    setMobileSheetOpen(true);
  }, []);

  // Gallery images from event data
  const galleryImages = eventData.gallery || [];

  // Main content shared between loading and hydrated states
  const mainContent = (
    <section className="mx-auto w-full max-w-6xl">
      {/* Action bar with status and buttons */}
      <EditorActionBar
        isPublished={isPublished}
        lastSaved={eventData.updatedAt}
        isSavingDraft={isSavingDraft}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraftInline}
        onPublish={handlePublish}
      />

      {/* Gallery at top */}
      <EditableGallerySection
        images={galleryImages}
        eventName={eventData.name}
        onUpdate={(images) => updateEventData({ gallery: images })}
      />

      {/* Event Title Section */}
      <EditableEventTitleSection
        name={eventData.name}
        organizer={eventData.organizer}
        location={eventData.location}
        onUpdate={updateEventData}
      />

      {/* Change History (if any unpublished changes) */}
      <ChangeHistoryBar
        changes={changeLog}
        onDiscard={discardChanges}
        gradient={organizerGradient}
      />

      {/* Content sections via UnifiedEventDetailBody */}
      <UnifiedEventDetailBody
        eventData={eventData}
        onUpdate={updateEventData}
        organizerGradient={organizerGradient}
        editable
        hideRegistration
        hideGallerySection
        displayProps={displayProps}
      />
    </section>
  );

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return (
      <>
        <FocusModeHeader
          onBack={handleBack}
          onOpenMobileSettings={handleOpenMobileSettings}
        />
        <div className="h-[calc(100vh-68px)] overflow-y-auto scrollbar-hide">
          <main className="p-8">{mainContent}</main>
        </div>
      </>
    );
  }

  return (
    <>
      <FocusModeHeader
        onBack={handleBack}
        onOpenMobileSettings={handleOpenMobileSettings}
      />

      <div className="flex h-[calc(100vh-68px)]">
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <main className="p-8">{mainContent}</main>
        </div>

        {/* Desktop: Right sidebar - pushes content */}
        {!isMobile && (
          <EventSettingsSidebar
            collapsed={!sidebarOpen}
            onToggleCollapse={toggleSidebar}
          />
        )}
      </div>

      {/* Mobile: Sheet for settings */}
      {isMobile && (
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <SheetHeader className="border-b border-border px-6 py-4">
              <SheetTitle>Event Settings</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto p-6">
              <EventSettingsSidebar variant="mobile" />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Unsaved changes confirmation modal */}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onOpenChange={setShowUnsavedModal}
        onDiscard={handleDiscard}
        onSaveDraft={handleSaveDraftAndBack}
      />
    </>
  );
}
