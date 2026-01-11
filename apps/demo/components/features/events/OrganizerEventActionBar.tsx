"use client";

import { Button } from "@workspace/ui/shadcn/button";
import { PencilIcon } from "lucide-react";
import { ActionBar, type ActionBarTab } from "@/components/layout/ActionBar";
import { useAuth } from "@/components/providers/AuthProvider";
import { findOrganizerById } from "@/data/events/organizers";

type OrganizerEventActionBarProps = {
  eventId: string;
  eventOrganizerName: string;
  isDraft?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEdit?: () => void;
  /** ActionBar visual variant */
  variant?: "full-width" | "contained" | "unstyled";
  /** Additional class names */
  className?: string;
  /** Accent color for the tab underline (CSS color or gradient) */
  accentColor?: string;
};

const TABS: ActionBarTab[] = [
  { id: "event-page", label: "Event Page" },
  { id: "registrations", label: "Registrations" },
  { id: "settings", label: "Settings" },
];

export function OrganizerEventActionBar({
  eventId,
  eventOrganizerName,
  isDraft = false,
  activeTab = "event-page",
  onTabChange,
  onEdit,
  variant = "contained",
  className,
  accentColor,
}: OrganizerEventActionBarProps) {
  void eventId;
  void isDraft;
  const { user, status } = useAuth();

  // Only show for authenticated organizers
  if (
    status !== "authenticated" ||
    user?.role !== "organizer" ||
    !user.organizerId
  ) {
    return null;
  }

  // Check if this organizer owns the event
  const organizer = findOrganizerById(user.organizerId);
  const isOwner = organizer?.name === eventOrganizerName;

  if (!isOwner) {
    return null;
  }

  return (
    <ActionBar
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabAccentColor={accentColor}
      variant={variant}
      className={className}
      actions={
        onEdit ? (
          <Button variant="default" onClick={onEdit}>
            <PencilIcon className="mr-2 size-4" />
            Edit Event
          </Button>
        ) : undefined
      }
    />
  );
}
