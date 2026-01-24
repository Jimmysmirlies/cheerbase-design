"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
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
  /** Raw JSON for comparison (not displayed) */
  rawOld?: string;
  rawNew?: string;
};

/** Get localStorage key for changeLog persistence */
function getChangeLogStorageKey(eventId: string): string {
  return `cheerbase-event-changelog-${eventId}`;
}

/** Division type for price tracking */
type DivisionForTracking = {
  name: string;
  regular?: { price?: number };
  earlyBird?: { price?: number };
};

/** Compare divisions and add individual price changes to the log */
function compareDivisionsAndAddChanges(
  log: FieldChange[],
  oldDivisions: DivisionForTracking[] | undefined,
  newDivisions: DivisionForTracking[] | undefined,
) {
  const oldMap = new Map((oldDivisions || []).map((d) => [d.name, d]));
  const newMap = new Map((newDivisions || []).map((d) => [d.name, d]));

  // Track changes for each division in the new list
  for (const [name, newDiv] of newMap) {
    const oldDiv = oldMap.get(name);

    // Track regular price changes
    const oldRegular = oldDiv?.regular?.price;
    const newRegular = newDiv.regular?.price;
    if (oldRegular !== newRegular) {
      const fieldKey = `division_${name}_regular`;
      const existingIndex = log.findIndex((c) => c.field === fieldKey);
      const formattedOld = oldRegular !== undefined ? `$${oldRegular}` : "not set";
      const formattedNew = newRegular !== undefined ? `$${newRegular}` : "not set";

      if (existingIndex >= 0) {
        const existing = log[existingIndex];
        if (existing) {
          log[existingIndex] = {
            ...existing,
            newValue: formattedNew,
            rawNew: String(newRegular),
          };
        }
      } else {
        log.push({
          field: fieldKey,
          displayName: `${name} price`,
          oldValue: formattedOld,
          newValue: formattedNew,
          rawOld: String(oldRegular),
          rawNew: String(newRegular),
        });
      }
    }

    // Track early bird price changes
    const oldEarlyBird = oldDiv?.earlyBird?.price;
    const newEarlyBird = newDiv.earlyBird?.price;
    if (oldEarlyBird !== newEarlyBird) {
      const fieldKey = `division_${name}_earlyBird`;
      const existingIndex = log.findIndex((c) => c.field === fieldKey);
      const formattedOld = oldEarlyBird !== undefined ? `$${oldEarlyBird}` : "not set";
      const formattedNew = newEarlyBird !== undefined ? `$${newEarlyBird}` : "not set";

      if (existingIndex >= 0) {
        const existing = log[existingIndex];
        if (existing) {
          log[existingIndex] = {
            ...existing,
            newValue: formattedNew,
            rawNew: String(newEarlyBird),
          };
        }
      } else {
        log.push({
          field: fieldKey,
          displayName: `${name} early bird price`,
          oldValue: formattedOld,
          newValue: formattedNew,
          rawOld: String(oldEarlyBird),
          rawNew: String(newEarlyBird),
        });
      }
    }
  }

  // Track removed divisions
  for (const [name] of oldMap) {
    if (!newMap.has(name)) {
      const fieldKey = `division_${name}_removed`;
      const existingIndex = log.findIndex((c) => c.field === fieldKey);
      if (existingIndex < 0) {
        log.push({
          field: fieldKey,
          displayName: name,
          oldValue: "exists",
          newValue: "removed",
          rawOld: "exists",
          rawNew: "removed",
        });
      }
    }
  }

  // Track added divisions
  for (const [name, newDiv] of newMap) {
    if (!oldMap.has(name)) {
      const fieldKey = `division_${name}_added`;
      const existingIndex = log.findIndex((c) => c.field === fieldKey);
      const price = newDiv.regular?.price;
      if (existingIndex < 0) {
        log.push({
          field: fieldKey,
          displayName: name,
          oldValue: "not set",
          newValue: price !== undefined ? `added @ $${price}` : "added",
          rawOld: "not set",
          rawNew: "added",
        });
      }
    }
  }
}

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
  hasUnpublishedChanges: boolean;
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
  undefined,
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
    initialEventId,
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
  const [changeLogInitialized, setChangeLogInitialized] = useState(false);

  const isPublished = eventData.status === "published" || wasPublished;
  const hasUnpublishedChanges = isPublished && changeLog.length > 0;
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
  const fieldDisplayNames: Record<string, string> = useMemo(
    () => ({
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
    }),
    [],
  );

  // Format value for display (declared early for use in changeLog computation)
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
          // Show division names and prices for meaningful display
          const divisions = value as Array<{
            name: string;
            regular?: { price?: number };
            earlyBird?: { price?: number };
          }>;
          if (divisions.length === 0) return "no divisions";
          if (divisions.length === 1) {
            const div = divisions[0];
            const price = div?.regular?.price;
            return price !== undefined ? `${div?.name} @ $${price}` : div?.name || "1 division";
          }
          // For multiple divisions, show count and price range
          const prices = divisions
            .map((d) => d.regular?.price)
            .filter((p): p is number => p !== undefined);
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            const priceRange = min === max ? `$${min}` : `$${min}-$${max}`;
            return `${divisions.length} divisions (${priceRange})`;
          }
          return `${divisions.length} divisions`;
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

      // Handle strings - truncate if too long but include length for uniqueness
      const strValue = String(value);
      if (strValue.length > 50) {
        // Include character count to distinguish different long texts
        return `${strValue.substring(0, 35)}... (${strValue.length} chars)`;
      }
      return strValue;
    },
    [],
  );

  // Load changeLog from localStorage or compute from draft vs published
  useEffect(() => {
    if (changeLogInitialized) return;
    if (!currentEventId) {
      setChangeLogInitialized(true);
      return;
    }

    // Try to load saved changeLog from localStorage
    const storageKey = getChangeLogStorageKey(currentEventId);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as FieldChange[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChangeLog(parsed);
          setChangeLogInitialized(true);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // If no saved changeLog, compute from draft vs published
    if (mode === "edit" && wasPublished) {
      const published = getPublishedEvent(currentEventId);
      if (published) {
        const computedLog: FieldChange[] = [];
        const fieldsToCompare = Object.keys(fieldDisplayNames);

        for (const key of fieldsToCompare) {
          // Special handling for availableDivisions - track individual price changes
          if (key === "availableDivisions") {
            compareDivisionsAndAddChanges(
              computedLog,
              published.availableDivisions as DivisionForTracking[] | undefined,
              eventData.availableDivisions as DivisionForTracking[] | undefined,
            );
            continue;
          }

          const publishedValue = published[key as keyof Event];
          const currentValue = eventData[key as keyof Event];
          const rawOld = JSON.stringify(publishedValue);
          const rawNew = JSON.stringify(currentValue);

          if (rawOld !== rawNew) {
            computedLog.push({
              field: key,
              displayName: fieldDisplayNames[key] || key,
              oldValue: formatValueForDisplay(key, publishedValue),
              newValue: formatValueForDisplay(key, currentValue),
              rawOld,
              rawNew,
            });
          }
        }

        if (computedLog.length > 0) {
          setChangeLog(computedLog);
        }
      }
    }

    setChangeLogInitialized(true);
  }, [
    currentEventId,
    mode,
    wasPublished,
    getPublishedEvent,
    eventData,
    fieldDisplayNames,
    formatValueForDisplay,
    changeLogInitialized,
  ]);

  // Persist changeLog to localStorage when it changes
  useEffect(() => {
    if (!changeLogInitialized) return;
    if (!currentEventId) return;

    const storageKey = getChangeLogStorageKey(currentEventId);
    if (changeLog.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(changeLog));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [changeLog, currentEventId, changeLogInitialized]);

  // Update event data
  const updateEventData = useCallback(
    (updates: Partial<Event>) => {
      setEventData((prev) => {
        // Update change log with before/after values
        setChangeLog((prevLog) => {
          const updatedLog = [...prevLog];

          for (const [key, newValue] of Object.entries(updates)) {
            const oldValue = prev[key as keyof Event];

            // Special handling for availableDivisions - track individual price changes
            if (key === "availableDivisions") {
              compareDivisionsAndAddChanges(
                updatedLog,
                oldValue as DivisionForTracking[] | undefined,
                newValue as DivisionForTracking[],
              );
              continue;
            }

            const displayName = fieldDisplayNames[key] || key;
            const rawOld = JSON.stringify(oldValue);
            const rawNew = JSON.stringify(newValue);

            // Only track if value actually changed
            if (rawOld !== rawNew) {
              const existingIndex = updatedLog.findIndex(
                (c) => c.field === key,
              );
              const formattedNew = formatValueForDisplay(key, newValue);

              if (existingIndex >= 0) {
                // Update existing entry, keep original oldValue and rawOld
                const existing = updatedLog[existingIndex];
                if (existing) {
                  updatedLog[existingIndex] = {
                    field: existing.field,
                    displayName: existing.displayName,
                    oldValue: existing.oldValue,
                    newValue: formattedNew,
                    rawOld: existing.rawOld,
                    rawNew,
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
                  rawOld,
                  rawNew,
                });
              }
            }
          }

          // Filter out changes where raw values are the same (reverted changes)
          return updatedLog.filter(
            (change) => change.rawOld !== change.rawNew,
          );
        });

        return { ...prev, ...updates };
      });

      setIsDirty(true);
    },
    [formatValueForDisplay, fieldDisplayNames],
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
    ],
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

      // Clear changeLog from localStorage
      const storageKey = getChangeLogStorageKey(finalEventId);
      localStorage.removeItem(storageKey);
      setChangeLog([]);

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
      // Clear changeLog from localStorage
      const storageKey = getChangeLogStorageKey(currentEventId);
      localStorage.removeItem(storageKey);
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
  }, [currentEventId, canCancel, eventData, saveDraft, deleteDraft, router]);

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
      hasUnpublishedChanges,
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
      hasUnpublishedChanges,
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
    ],
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
