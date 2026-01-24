import type { ReactNode } from "react";
import type { Event } from "@/types/events";
import type { BrandGradient } from "@/lib/gradients";

/** Mode for section rendering */
export type SectionMode = "view" | "edit";

/** Base props shared by all section components */
export type BaseSectionProps = {
  /** Rendering mode: view-only or editable */
  mode: SectionMode;
  /** Event data (can be partial for drafts) */
  eventData: Partial<Event>;
  /** Callback when editing changes data (only used in edit mode) */
  onUpdate?: (updates: Partial<Event>) => void;
  /** Callback to close edit mode (only used in edit mode) */
  onCloseEdit?: () => void;
  /** Organizer gradient for styling */
  organizerGradient?: BrandGradient;
};

/** Props for the SectionWrapper component */
export type SectionWrapperProps = {
  /** Section ID for anchor links */
  id: string;
  /** Section title */
  title: string;
  /** Optional right-aligned content (e.g., early bird badge) */
  titleRight?: ReactNode;
  /** Whether this section is currently being edited */
  isEditing?: boolean;
  /** Callback to start editing (if undefined, section is view-only) */
  onStartEdit?: () => void;
  /** Callback when done editing (commits to in-memory state) */
  onSave?: () => void;
  /** Callback to cancel editing */
  onCancel?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Show divider above section */
  showDivider?: boolean;
  /** View mode content */
  viewContent: ReactNode;
  /** Edit mode content (required if onStartEdit is provided) */
  editContent?: ReactNode;
  /** Empty state content (shown when no data and section is editable) */
  emptyState?: ReactNode;
  /** Whether the section has data to display */
  hasData: boolean;
};

/** Section definition for use in UnifiedEventDetailBody */
export type SectionDefinition = {
  id: string;
  title: string;
  /** Check if section has data */
  hasData: (eventData: Partial<Event>) => boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Whether this section is editable */
  editable?: boolean;
};
