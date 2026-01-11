"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "@workspace/ui/shadcn/sonner";
import type { Event } from "@/types/events";
import type { BrandGradient } from "@/lib/gradients";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOrganizerEventDrafts } from "@/hooks/useOrganizerEventDrafts";
import { useOrganizerEventPublished } from "@/hooks/useOrganizerEventPublished";
import { findOrganizerById } from "@/data/events/organizers";

type EventEditorMode = "create" | "edit";

/** Represents a single field change with before/after values */
type FieldChange = {
  field: string;
  displayName: string;
  oldValue: string;
  newValue: string;
};

type EventEditorContextValue = {
  // Event data
  eventData: Partial<Event>;
  setEventData: (data: Partial<Event>) => void;
  updateEventData: (updates: Partial<Event>) => void;

  // Event metadata
  eventId?: string;
  mode: EventEditorMode;
  organizerGradient: BrandGradient;

  // Status
  isDirty: boolean;
  isPublished: boolean;
  isCancelled: boolean;
  hasRegistrations: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  /** Detailed list of changes with before/after values */
  changeLog: FieldChange[];

  // Actions
  saveSection: (updates: Partial<Event>) => Promise<void>;
  publishEvent: () => Promise<void>;
  discardChanges: () => void;
  /** Unpublish event - returns to draft state. Only available if no registrations. */
  unpublishEvent: () => void;
  /** Cancel event - marks as cancelled, keeps visible. For events with registrations. */
  cancelEvent: () => void;
  /** Delete event - permanently removes. Only available for drafts or cancelled events without registrations. */
  deleteEvent: () => void;
  /** Check if unpublish is allowed */
  canUnpublish: boolean;
  /** Check if cancel is allowed */
  canCancel: boolean;
  /** Check if delete is allowed */
  canDelete: boolean;
};

const EventEditorContext = createContext<EventEditorContextValue | undefined>(
  undefined
);

type EventEditorProviderProps = {
  children: ReactNode;
  initialEvent?: Partial<Event>;
  eventId?: string;
  mode: EventEditorMode;
};

export function EventEditorProvider({
  children,
  initialEvent,
  eventId: initialEventId,
  mode,
}: EventEditorProviderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const organizerId = user?.organizerId;
  const organizer = organizerId ? findOrganizerById(organizerId) : null;

  const { getDraft, saveDraft, deleteDraft } =
    useOrganizerEventDrafts(organizerId);
  const {
    publishEvent: publishToStorage,
    getPublishedEvent,
    unpublishEvent: unpublishFromStorage,
  } = useOrganizerEventPublished(organizerId);

  // Track current event ID (may change on first save in create mode)
  const [currentEventId, setCurrentEventId] = useState<string | undefined>(
    initialEventId
  );

  // Check if event was previously published (from storage or initial data)
  const wasPublished = useMemo(() => {
    // Check if initial event was published
    if (initialEvent?.status === "published") return true;
    // Base events (static mock data) don't have status field - treat as published
    // since they're in the public catalog
    if (initialEvent && !initialEvent.status && mode === "edit") return true;
    // Check localStorage
    if (!currentEventId) return false;
    const published = getPublishedEvent(currentEventId);
    return !!published;
  }, [currentEventId, getPublishedEvent, initialEvent, mode]);

  // Load initial event data
  const [eventData, setEventData] = useState<Partial<Event>>(() => {
    if (mode === "edit" && initialEventId) {
      const draft = getDraft(initialEventId);
      // Smart merge: start with initial event, then apply only non-empty draft values
      if (draft && initialEvent) {
        const merged = { ...initialEvent };
        for (const [key, value] of Object.entries(draft)) {
          // Only apply draft value if it's not empty/null/undefined
          // For arrays, check length; for strings, check non-empty; for others, check truthy
          const isEmpty =
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);
          if (!isEmpty) {
            (merged as Record<string, unknown>)[key] = value;
          }
        }
        return merged;
      }
      if (draft) return draft;
      if (initialEvent) return initialEvent;
    }

    // Create mode defaults
    return (
      initialEvent || {
        organizer: organizer?.name || "",
        status: "draft",
        visibility: "public",
        slots: { filled: 0, capacity: 0 },
        type: "Championship",
        image: "",
        description: "",
        teams: "0 / 0 teams",
        name: "",
      }
    );
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [changeLog, setChangeLog] = useState<FieldChange[]>([]);

  const isPublished = eventData.status === "published" || wasPublished;
  // Note: "cancelled" status is not currently in the Event type, so always false for now
  const isCancelled = false;
  // For demo purposes, check if slots.filled > 0 to simulate registrations
  const hasRegistrations = (eventData.slots?.filled ?? 0) > 0;
  const organizerGradient: BrandGradient = organizer?.gradient || "teal";

  // Determine what actions are allowed
  const canUnpublish = isPublished && !isCancelled && !hasRegistrations;
  const canCancel = isPublished && !isCancelled;
  const canDelete = (!isPublished || isCancelled) && !hasRegistrations;

  // Field name mapping for display
  const fieldDisplayNames: Record<string, string> = {
    name: "Event Title",
    description: "Description",
    date: "Event Date",
    location: "Location",
    venue: "Venue",
    registrationStartDate: "Registration Opens",
    registrationDeadline: "Registration Closes",
    registrationEnabled: "Registration",
    earlyBirdEnabled: "Early Bird Pricing",
    earlyBirdDeadline: "Early Bird Deadline",
    earlyBirdDiscount: "Early Bird Discount",
    availableDivisions: "Division Pricing",
    gallery: "Gallery",
    image: "Cover Image",
    documents: "Documents",
    status: "Status",
    visibility: "Visibility",
    slots: "Team Capacity",
  };

  // Format value for display
  const formatValueForDisplay = useCallback(
    (key: string, value: unknown): string => {
      if (value === null || value === undefined) return "empty";
      if (value === "") return "empty";

      // Handle booleans
      if (typeof value === "boolean") {
        if (key === "earlyBirdEnabled") return value ? "enabled" : "disabled";
        if (key === "registrationEnabled")
          return value ? "enabled" : "disabled";
        return value ? "Yes" : "No";
      }

      // Handle dates
      if (key.includes("Date") || key.includes("Deadline")) {
        try {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
        } catch {
          // Fall through to string conversion
        }
      }

      // Handle arrays (like gallery, documents, availableDivisions)
      if (Array.isArray(value)) {
        if (key === "availableDivisions") {
          return `${value.length} division${value.length !== 1 ? "s" : ""}`;
        }
        if (key === "gallery") {
          return `${value.length} image${value.length !== 1 ? "s" : ""}`;
        }
        if (key === "documents") {
          return `${value.length} document${value.length !== 1 ? "s" : ""}`;
        }
        return `${value.length} item${value.length !== 1 ? "s" : ""}`;
      }

      // Handle objects (like slots)
      if (typeof value === "object") {
        if (key === "slots" && "capacity" in (value as object)) {
          const slots = value as { capacity?: number };
          return slots.capacity ? `${slots.capacity} teams` : "Unlimited";
        }
        return JSON.stringify(value);
      }

      // Handle strings - truncate if too long
      const strValue = String(value);
      if (strValue.length > 50) {
        return strValue.substring(0, 47) + "...";
      }
      return strValue;
    },
    []
  );

  // Update event data
  const updateEventData = useCallback(
    (updates: Partial<Event>) => {
      setEventData((prev) => {
        // Update change log with before/after values
        setChangeLog((prevLog) => {
          const updatedLog = [...prevLog];

          for (const [key, newValue] of Object.entries(updates)) {
            const oldValue = prev[key as keyof Event];
            const displayName = fieldDisplayNames[key] || key;

            // Only track if value actually changed
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
              const existingIndex = updatedLog.findIndex((c) => c.field === key);
              const formattedNew = formatValueForDisplay(key, newValue);

              if (existingIndex >= 0) {
                // Update existing entry, keep original oldValue
                const existing = updatedLog[existingIndex];
                if (existing) {
                  updatedLog[existingIndex] = {
                    field: existing.field,
                    displayName: existing.displayName,
                    oldValue: existing.oldValue,
                    newValue: formattedNew,
                  };
                }
              } else {
                // Add new entry with the old value from current state
                const formattedOld = formatValueForDisplay(key, oldValue);
                updatedLog.push({
                  field: key,
                  displayName,
                  oldValue: formattedOld,
                  newValue: formattedNew,
                });
              }
            }
          }

          // Filter out changes where old and new are the same (reverted changes)
          return updatedLog.filter(
            (change) => change.oldValue !== change.newValue
          );
        });

        return { ...prev, ...updates };
      });

      setIsDirty(true);
    },
    [formatValueForDisplay]
  );

  // Save a section (or any partial update)
  const saveSection = useCallback(
    async (updates: Partial<Event>) => {
      if (!organizerId) return;

      setIsSaving(true);
      try {
        const finalEventId = currentEventId || `event-${Date.now()}`;
        const mergedData = { ...eventData, ...updates };

        const draftEvent: Event = {
          ...mergedData,
          id: finalEventId,
          organizer: organizer?.name || "",
          status: isPublished ? "published" : "draft",
          updatedAt: new Date().toISOString(),
        } as Event;

        saveDraft(draftEvent);
        setEventData(mergedData);

        // In create mode, navigate to edit URL after first save
        if (mode === "create" && !currentEventId) {
          setCurrentEventId(finalEventId);
          router.replace(`/organizer/events/${finalEventId}/edit`);
        }

        setIsDirty(false);
      } finally {
        setIsSaving(false);
      }
    },
    [
      eventData,
      organizerId,
      organizer,
      currentEventId,
      mode,
      isPublished,
      saveDraft,
      router,
    ]
  );

  // Publish the event
  const publishEventAction = useCallback(async () => {
    if (!organizerId) return;

    // Validate required fields
    const missing: string[] = [];
    if (!eventData.name) missing.push("event name");
    if (!eventData.description) missing.push("description");
    if (!eventData.date) missing.push("event date");
    if (!eventData.location) missing.push("location");

    if (missing.length > 0) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    setIsPublishing(true);
    try {
      const finalEventId = currentEventId || `event-${Date.now()}`;

      const finalEvent: Event = {
        ...eventData,
        id: finalEventId,
        organizer: organizer?.name || "",
        status: "published",
        updatedAt: new Date().toISOString(),
      } as Event;

      publishToStorage(finalEvent);

      // Remove draft if it exists
      if (currentEventId) {
        deleteDraft(currentEventId);
      }

      toast.success("Event published successfully!");
      router.push(`/events/${finalEvent.id}`);
    } catch (error) {
      toast.error("Failed to publish event");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  }, [
    eventData,
    organizerId,
    organizer,
    currentEventId,
    publishToStorage,
    deleteDraft,
    router,
  ]);

  // Discard changes (revert to published version)
  const discardChanges = useCallback(() => {
    if (!currentEventId) return;
    const published = getPublishedEvent(currentEventId);
    if (published) {
      setEventData(published);
      deleteDraft(currentEventId);
      setIsDirty(false);
      setChangeLog([]);
      toast.success("Changes discarded");
    }
  }, [currentEventId, getPublishedEvent, deleteDraft]);

  // Unpublish event - returns to draft state
  const unpublishEventAction = useCallback(() => {
    if (!currentEventId || !canUnpublish) return;

    // Remove from published storage
    unpublishFromStorage(currentEventId);

    // Update local state to draft
    setEventData((prev) => ({ ...prev, status: "draft" }));
    setChangeLog([]);
    setIsDirty(false);

    toast.success("Event unpublished and returned to draft");
    router.push("/organizer/events");
  }, [currentEventId, canUnpublish, unpublishFromStorage, router]);

  // Cancel event - marks as draft (not published), keeps in drafts
  // Note: "cancelled" status is not in Event type, using draft instead
  const cancelEventAction = useCallback(() => {
    if (!currentEventId || !canCancel) return;

    const cancelledEvent = {
      ...eventData,
      id: currentEventId,
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
    } as Event;

    // Save as draft (removes from published)
    saveDraft(cancelledEvent);

    // Remove from published storage
    deleteDraft(currentEventId);

    setEventData(cancelledEvent);
    setChangeLog([]);
    setIsDirty(false);

    toast.success("Event cancelled. Registered attendees will be notified.");
    router.push("/organizer/events");
  }, [
    currentEventId,
    canCancel,
    eventData,
    saveDraft,
    deleteDraft,
    router,
  ]);

  // Delete event - permanently removes
  const deleteEventAction = useCallback(() => {
    if (!currentEventId || !canDelete) return;

    // Remove from both storages
    unpublishFromStorage(currentEventId);
    deleteDraft(currentEventId);

    toast.success("Event deleted permanently");
    router.push("/organizer/events");
  }, [currentEventId, canDelete, unpublishFromStorage, deleteDraft, router]);

  const value = useMemo<EventEditorContextValue>(
    () => ({
      eventData,
      setEventData,
      updateEventData,
      eventId: currentEventId,
      mode,
      organizerGradient,
      isDirty,
      isPublished,
      isCancelled,
      hasRegistrations,
      isSaving,
      isPublishing,
      changeLog,
      saveSection,
      publishEvent: publishEventAction,
      discardChanges,
      unpublishEvent: unpublishEventAction,
      cancelEvent: cancelEventAction,
      deleteEvent: deleteEventAction,
      canUnpublish,
      canCancel,
      canDelete,
    }),
    [
      eventData,
      updateEventData,
      currentEventId,
      mode,
      organizerGradient,
      isDirty,
      isPublished,
      isCancelled,
      hasRegistrations,
      isSaving,
      isPublishing,
      changeLog,
      saveSection,
      publishEventAction,
      discardChanges,
      unpublishEventAction,
      cancelEventAction,
      deleteEventAction,
      canUnpublish,
      canCancel,
      canDelete,
    ]
  );

  return (
    <EventEditorContext.Provider value={value}>
      {children}
    </EventEditorContext.Provider>
  );
}

export function useEventEditor() {
  const ctx = useContext(EventEditorContext);
  if (!ctx) {
    throw new Error("useEventEditor must be used within EventEditorProvider");
  }
  return ctx;
}

export function useEventEditorSafe() {
  return useContext(EventEditorContext);
}
