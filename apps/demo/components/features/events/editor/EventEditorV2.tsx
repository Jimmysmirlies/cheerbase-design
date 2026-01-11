"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/shadcn/sheet";
import { FocusModeHeader } from "@/components/layout/FocusModeHeader";
import { useEventEditor } from "@/components/providers/EventEditorProvider";
import { useFocusModeSettings } from "@/hooks/useFocusModeSettings";
import { useEventDisplayProps } from "@/hooks/useEventDisplayProps";
import { UnifiedEventDetailBody } from "@/components/features/events/UnifiedEventDetailBody";
import { EventSettingsSidebar } from "./EventSettingsSidebar";
import { EditorActionBar } from "./EditorActionBar";

export function EventEditorV2() {
  const {
    eventData,
    updateEventData,
    saveSection,
    publishEvent,
    discardChanges,
    organizerGradient,
    eventId,
    isDirty,
    isPublished,
    isPublishing,
  } = useEventEditor();

  const { sidebarOpen, toggleSidebar, isHydrated } = useFocusModeSettings();

  // Compute display props for WYSIWYG preview
  const displayProps = useEventDisplayProps(eventData, organizerGradient);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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

  const handleSave = useCallback(
    async (updates: Partial<typeof eventData>) => {
      await saveSection(updates);
    },
    [saveSection]
  );

  const handlePublish = useCallback(() => {
    publishEvent();
  }, [publishEvent]);

  const handleDiscard = useCallback(() => {
    if (isPublished) {
      discardChanges();
    }
  }, [isPublished, discardChanges]);

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return (
      <>
        <FocusModeHeader />
        <EditorActionBar
          eventId={eventId}
          isDraft={!isPublished}
          isDirty={isDirty}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onDiscard={isPublished ? handleDiscard : undefined}
        />
        <div className="h-[calc(100vh-68px-57px)] overflow-y-auto py-8">
          <UnifiedEventDetailBody
            eventData={eventData}
            onUpdate={updateEventData}
            onSave={handleSave}
            organizerGradient={organizerGradient}
            editable
            hideRegistration
            layout="A"
            displayProps={displayProps}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <FocusModeHeader
        onOpenMobileSettings={isMobile ? () => setMobileSheetOpen(true) : undefined}
      />

      <EditorActionBar
        eventId={eventId}
        isDraft={!isPublished}
        isDirty={isDirty}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        onDiscard={isPublished ? handleDiscard : undefined}
      />

      <div className="h-[calc(100vh-68px-57px)] overflow-y-auto py-8">
        <UnifiedEventDetailBody
          eventData={eventData}
          onUpdate={updateEventData}
          onSave={handleSave}
          organizerGradient={organizerGradient}
          editable
          hideRegistration
          layout="A"
          displayProps={displayProps}
        />
      </div>

      {/* Desktop: Right sidebar - fixed to right edge, hidden on mobile */}
      {!isMobile && (
        <EventSettingsSidebar
          collapsed={!sidebarOpen}
          onToggleCollapse={toggleSidebar}
        />
      )}

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
    </>
  );
}
