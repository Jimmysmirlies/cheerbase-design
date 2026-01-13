"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/shadcn/sheet";
import { Button } from "@workspace/ui/shadcn/button";
import { Badge } from "@workspace/ui/shadcn/badge";
import { toast } from "@workspace/ui/shadcn/sonner";
import { FocusModeHeader } from "@/components/layout/FocusModeHeader";
import { useEventEditor } from "@/components/providers/EventEditorProvider";
import { useFocusModeSettings } from "@/hooks/useFocusModeSettings";
import { useEventDisplayProps } from "@/hooks/useEventDisplayProps";
import { UnifiedEventDetailBody } from "@/components/features/events/UnifiedEventDetailBody";
import { EventTitleHeader } from "@/components/features/events/EventTitleHeader";
import { EventSettingsSidebar } from "./EventSettingsSidebar";
import { UnsavedChangesModal } from "./UnsavedChangesModal";

export function EventEditor() {
  const router = useRouter();
  const {
    eventData,
    updateEventData,
    saveSection,
    publishEvent,
    organizerGradient,
    isPublished,
    isPublishing,
    isDirty,
  } = useEventEditor();

  const { sidebarOpen, toggleSidebar, isHydrated } = useFocusModeSettings();

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

  const handleSave = useCallback(
    async (updates: Partial<typeof eventData>) => {
      await saveSection(updates);
    },
    [saveSection]
  );

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

  // Save draft and navigate back
  const handleSaveDraft = useCallback(async () => {
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

  // Header content shared between loading and loaded states
  const headerContent = eventData.name ? (
    <div className="pb-8">
      <EventTitleHeader
      name={eventData.name}
      date={eventData.date}
      location={eventData.location}
      gradient={organizerGradient}
      badge={
        isPublished ? (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Published
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Draft
          </Badge>
        )
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
          >
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing
              ? "Saving..."
              : isPublished
                ? "Update Event"
                : "Publish Event"}
          </Button>
        </div>
      }
    />
    </div>
  ) : null;

  // Wait for hydration to avoid flash
  if (!isHydrated) {
    return (
      <>
        <FocusModeHeader onBack={handleBack} />
        <div className="h-[calc(100vh-68px)] overflow-y-auto scrollbar-hide">
          <main className="p-8">
            <section className="mx-auto w-full max-w-7xl">
              {headerContent}
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
            </section>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <FocusModeHeader
        onBack={handleBack}
        onOpenMobileSettings={isMobile ? () => setMobileSheetOpen(true) : undefined}
      />

      <div className="flex h-[calc(100vh-68px)]">
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <main className="p-8">
            <section className="mx-auto w-full max-w-7xl">
              {headerContent}
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
            </section>
          </main>
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
        onSaveDraft={handleSaveDraft}
      />
    </>
  );
}
