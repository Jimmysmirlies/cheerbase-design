"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRightIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  DownloadIcon,
  LockIcon,
  MapPinIcon,
  PlusIcon,
  UploadIcon,
} from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent } from "@workspace/ui/shadcn/card";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { type BrandGradient } from "@/lib/gradients";
import {
  TeamCard,
  type TeamData,
  type TeamMember,
} from "@/components/features/clubs/TeamCard";
import { OrganizerCard } from "@/components/features/clubs/OrganizerCard";
import { RegistrationPaymentCTA } from "@/components/features/clubs/RegistrationPaymentCTA";
import { EditRegistrationDialog } from "@/components/features/clubs/EditRegistrationDialog";
import { fadeInUp, staggerSections } from "@/lib/animations";
import { formatCurrency } from "@/utils/format";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RegisterTeamModal } from "@/components/features/registration/flow/RegisterTeamModal";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import type {
  RegistrationMember,
  RegistrationEntry,
} from "@/components/features/registration/flow/types";
import { DEFAULT_ROLE } from "@/components/features/registration/flow/types";
import { toast } from "@workspace/ui/shadcn/sonner";
import {
  useRegistrationStorage,
  mapToRecord,
  recordToMap,
} from "@/hooks/useRegistrationStorage";
import { WalkthroughSpotlight } from "@/components/ui/RegistrationWalkthrough";
import { LayoutToggle } from "@/components/ui/controls/LayoutToggle";

type LayoutVariant = "A" | "B" | "C";

const LAYOUT_TUTORIAL_STORAGE_KEY = "layout-toggle-tutorial-seen";
const LAYOUT_TUTORIAL_ITEMS = [
  { label: "A", description: "Two-column with sidebar" },
  { label: "B", description: "Single column with action banner" },
  { label: "C", description: "Single column with quick actions" },
];

// Registration-specific team data (TeamData with required detailId)
type RegisteredTeamData = TeamData & { detailId: string };

type InvoiceLineItem = {
  category: string;
  unit: number;
  qty: number;
  lineTotal: number;
};

type DivisionPricingProp = {
  name: string;
  earlyBird?: {
    price: number;
    deadline?: string;
  };
  regular: {
    price: number;
  };
};

type TeamOption = {
  id: string;
  name: string;
  division?: string;
  size?: number;
};

type DocumentResource = {
  name: string;
  description: string;
  href: string;
};

export type TeamRosterData = {
  teamId: string;
  members: TeamMember[];
};

type RegistrationDetailContentProps = {
  registration: {
    id: string;
    eventName: string;
    eventId: string;
  };
  organizerName: string;
  organizerGradientVariant: BrandGradient;
  organizerFollowersLabel: string;
  organizerEventsCount: number;
  organizerHostingLabel: string;
  locationLabel: string;
  googleMapsHref: string | null;
  eventDateLabel: string;
  eventDateWeekday: string | null;
  registrationDeadlineLabel: string | null;
  isLocked: boolean;
  allDivisions: string[];
  teamsByDivisionArray: [string, RegisteredTeamData[]][];
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceTotalLabel: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceHref: string;
  eventPageHref: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  paymentDeadlineLabel?: string;
  paymentTitle: string;
  paidAtLabel: string | null;
  dueDateMonth: string | null;
  dueDateDay: number | null;
  // Edit mode props
  isEditMode?: boolean;
  divisionPricing?: DivisionPricingProp[];
  teamOptions?: TeamOption[];
  teamRosters?: TeamRosterData[];
  // Event resources
  documents?: DocumentResource[];
};

export function RegistrationDetailContent({
  registration,
  organizerName,
  organizerGradientVariant,
  organizerFollowersLabel,
  organizerEventsCount,
  organizerHostingLabel,
  locationLabel,
  googleMapsHref,
  eventDateLabel,
  eventDateWeekday,
  registrationDeadlineLabel,
  isLocked,
  allDivisions,
  teamsByDivisionArray,
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceTotalLabel,
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
}: RegistrationDetailContentProps) {
  const router = useRouter();
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("A");

  // Edit mode state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [registerTeamOpen, setRegisterTeamOpen] = useState(false);
  const [rosterEditorOpen, setRosterEditorOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] =
    useState<RegisteredTeamData | null>(null);

  // Track teams added/removed in edit mode
  const [addedTeams, setAddedTeams] = useState<RegisteredTeamData[]>([]);
  const [removedTeamIds, setRemovedTeamIds] = useState<Set<string>>(new Set());
  // Track roster modifications for original teams (teamId -> modified members)
  const [modifiedRosters, setModifiedRosters] = useState<
    Map<string, TeamMember[]>
  >(new Map());

  // Persistent storage for registration changes
  const { isLoaded, savedChanges, saveChanges, clearChanges } =
    useRegistrationStorage(registration.id);

  // Hydrate state from localStorage on mount (for non-edit mode to show submitted changes)
  useEffect(() => {
    if (isLoaded && savedChanges && !isEditMode) {
      setAddedTeams(savedChanges.addedTeams);
      setRemovedTeamIds(new Set(savedChanges.removedTeamIds));
      setModifiedRosters(recordToMap(savedChanges.modifiedRosters));
    }
  }, [isLoaded, savedChanges, isEditMode]);

  // Convert array back to Map for easier lookups (original teams)
  const originalTeamsByDivision = useMemo(
    () => new Map<string, RegisteredTeamData[]>(teamsByDivisionArray),
    [teamsByDivisionArray],
  );

  // Merge original teams (minus removed) with added teams, applying roster modifications
  const teamsByDivision = useMemo(() => {
    const merged = new Map<string, RegisteredTeamData[]>();

    // Add original teams (excluding removed ones), with roster modifications applied
    originalTeamsByDivision.forEach((teams, division) => {
      const filteredTeams = teams
        .filter((t) => !removedTeamIds.has(t.id))
        .map((t) => {
          // Apply roster modifications if any
          const modifiedMembers = modifiedRosters.get(t.id);
          if (modifiedMembers) {
            return { ...t, members: modifiedMembers };
          }
          return t;
        });
      if (filteredTeams.length > 0) {
        merged.set(division, filteredTeams);
      }
    });

    // Add newly added teams
    addedTeams.forEach((team) => {
      const existing = merged.get(team.division) ?? [];
      merged.set(team.division, [...existing, team]);
    });

    return merged;
  }, [originalTeamsByDivision, addedTeams, removedTeamIds, modifiedRosters]);

  // Get all currently registered team IDs (for duplicate checking)
  const registeredTeamIds = useMemo(() => {
    const ids = new Set<string>();
    // Add original teams (not removed)
    originalTeamsByDivision.forEach((teams) => {
      teams.forEach((t) => {
        if (!removedTeamIds.has(t.id)) {
          ids.add(t.id);
          if (t.detailId) ids.add(t.detailId);
        }
      });
    });
    // Add newly added teams
    addedTeams.forEach((t) => {
      ids.add(t.id);
      if (t.detailId) ids.add(t.detailId);
    });
    return ids;
  }, [originalTeamsByDivision, addedTeams, removedTeamIds]);

  // Compute dynamic invoice line items for edit mode
  const editModeInvoice = useMemo(() => {
    // Start with original invoice items (mark removed ones, apply roster changes)
    type EditModeLineItem = InvoiceLineItem & {
      id: string;
      isNew: boolean;
      isRemoved: boolean;
      isModified: boolean;
      originalQty?: number;
    };

    const items: EditModeLineItem[] = [];

    // Add original line items with removed status and roster modifications
    invoiceLineItems.forEach((item, index) => {
      // Find which team this line item belongs to by matching division name
      // Invoice line items use category as division name
      const originalTeamsInDivision =
        teamsByDivisionArray.find(([div]) => div === item.category)?.[1] ?? [];
      const team = originalTeamsInDivision[0];
      const teamId = team?.id ?? `original-${index}`;
      const isRemoved = removedTeamIds.has(teamId);

      // Check if roster was modified
      const modifiedMembers = modifiedRosters.get(teamId);
      const hasRosterChange = modifiedMembers !== undefined;
      const newMemberCount = modifiedMembers?.length ?? item.qty;
      const isModified = hasRosterChange && newMemberCount !== item.qty;

      items.push({
        ...item,
        id: teamId,
        qty: newMemberCount,
        lineTotal: item.unit * newMemberCount,
        originalQty: isModified ? item.qty : undefined,
        isNew: false,
        isRemoved,
        isModified,
      });
    });

    // Add new teams as line items
    addedTeams.forEach((team) => {
      // Look up pricing for this team's division
      const divisionPriceInfo = divisionPricing.find(
        (d) => d.name === team.division,
      );
      const unitPrice =
        divisionPriceInfo?.regular?.price ??
        divisionPriceInfo?.earlyBird?.price ??
        33.75;
      const memberCount = team.members?.length ?? 24;

      items.push({
        id: team.id,
        category: team.division,
        unit: unitPrice,
        qty: memberCount,
        lineTotal: unitPrice * memberCount,
        isNew: true,
        isRemoved: false,
        isModified: false,
      });
    });

    // Calculate totals (excluding removed items)
    const activeItems = items.filter((item) => !item.isRemoved);
    const newSubtotal = activeItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );
    const taxRate = subtotal > 0 ? totalTax / subtotal : 0.15; // Use same tax rate or fallback to 15%
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax;

    const hasModifications = items.some((item) => item.isModified);

    return {
      items,
      subtotal: newSubtotal,
      tax: newTax,
      total: newTotal,
      hasChanges:
        addedTeams.length > 0 || removedTeamIds.size > 0 || hasModifications,
    };
  }, [
    invoiceLineItems,
    teamsByDivisionArray,
    addedTeams,
    removedTeamIds,
    modifiedRosters,
    divisionPricing,
    subtotal,
    totalTax,
  ]);

  // Check if a team is already registered
  const isTeamAlreadyRegistered = (teamId: string) => {
    return registeredTeamIds.has(teamId);
  };

  // Handle import from dialogs
  const handleBulkImport = (entries: RegistrationEntry[]) => {
    // Filter out duplicates
    const uniqueEntries = entries.filter((entry) => {
      const checkId = entry.teamId ?? entry.id;
      return !isTeamAlreadyRegistered(checkId);
    });

    const duplicateCount = entries.length - uniqueEntries.length;

    if (uniqueEntries.length === 0) {
      toast.error("No teams imported", {
        description: "All teams in the import are already registered.",
      });
      setBulkUploadOpen(false);
      return;
    }

    const newTeams: RegisteredTeamData[] = uniqueEntries.map((entry) => {
      // Find the team in teamOptions to get size info
      const existingTeam = entry.teamId
        ? teamOptions.find((t) => t.id === entry.teamId)
        : null;
      // Find roster data for the team
      const rosterData = entry.teamId
        ? teamRosters.find((r) => r.teamId === entry.teamId)
        : null;

      return {
        id: entry.teamId ?? entry.id,
        name: entry.teamName ?? existingTeam?.name ?? "Imported Team",
        division: entry.division,
        members: rosterData?.members ?? [],
        detailId: entry.teamId ?? entry.id,
      };
    });

    setAddedTeams((prev) => [...prev, ...newTeams]);
    setBulkUploadOpen(false);

    if (duplicateCount > 0) {
      toast.success(
        `${newTeams.length} team${newTeams.length === 1 ? "" : "s"} imported`,
        {
          description: `${duplicateCount} duplicate${duplicateCount === 1 ? " was" : "s were"} skipped.`,
        },
      );
    } else {
      toast.success(
        `${newTeams.length} team${newTeams.length === 1 ? "" : "s"} imported`,
        {
          description: "Teams have been added to your registration.",
        },
      );
    }
  };

  const handleRegisterTeam = (entry: RegistrationEntry) => {
    const checkId = entry.teamId ?? entry.id;

    // Check for duplicate
    if (isTeamAlreadyRegistered(checkId)) {
      toast.error("Team already registered", {
        description: `${entry.teamName ?? "This team"} is already in your registration.`,
      });
      setRegisterTeamOpen(false);
      return;
    }

    // Find the team in teamOptions to get additional info
    const existingTeam = entry.teamId
      ? teamOptions.find((t) => t.id === entry.teamId)
      : null;
    // Find roster data for the team
    const rosterData = entry.teamId
      ? teamRosters.find((r) => r.teamId === entry.teamId)
      : null;

    const newTeam: RegisteredTeamData = {
      id: entry.teamId ?? entry.id,
      name: entry.teamName ?? existingTeam?.name ?? "New Team",
      division: entry.division,
      members: rosterData?.members ?? [],
      detailId: entry.teamId ?? entry.id,
    };

    setAddedTeams((prev) => [...prev, newTeam]);
    setRegisterTeamOpen(false);

    toast.success("Team added", {
      description: `${newTeam.name} has been added to ${entry.division}.`,
    });
  };

  // Handle team removal with undo support
  const handleRemoveTeam = (teamId: string) => {
    // Check if it's a newly added team
    const addedTeam = addedTeams.find((t) => t.id === teamId);
    if (addedTeam) {
      // Store for potential undo
      const removedTeam = addedTeam;
      setAddedTeams((prev) => prev.filter((t) => t.id !== teamId));

      toast.success("Team removed", {
        description: `${removedTeam.name} has been removed from your registration.`,
        action: {
          label: "Undo",
          onClick: () => {
            setAddedTeams((prev) => [...prev, removedTeam]);
            toast.success("Team restored", {
              description: `${removedTeam.name} has been added back.`,
            });
          },
        },
      });
    } else {
      // It's an original team - mark as removed
      setRemovedTeamIds((prev) => new Set([...prev, teamId]));

      // Find the team name for the toast
      let teamName = "Team";
      originalTeamsByDivision.forEach((teams) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) teamName = team.name;
      });

      toast.success("Team removed", {
        description: `${teamName} has been removed from your registration.`,
        action: {
          label: "Undo",
          onClick: () => {
            setRemovedTeamIds((prev) => {
              const next = new Set(prev);
              next.delete(teamId);
              return next;
            });
            toast.success("Team restored", {
              description: `${teamName} has been added back.`,
            });
          },
        },
      });
    }
  };

  // Handle team edit
  const handleEditTeam = (team: TeamData) => {
    // Cast to RegisteredTeamData since we know detailId exists in this context
    setSelectedTeamForEdit(team as RegisteredTeamData);
    setRosterEditorOpen(true);
  };

  // Convert team members to RegistrationMember format for editor
  const selectedTeamMembers: RegistrationMember[] = useMemo(() => {
    if (!selectedTeamForEdit?.members) return [];
    return selectedTeamForEdit.members.map((m) => {
      // Normalize role to capitalized format (e.g., "athlete" -> "Athlete")
      const normalizedRole = m.role
        ? m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()
        : DEFAULT_ROLE;
      return {
        name:
          m.name ?? [m.firstName, m.lastName].filter(Boolean).join(" ") ?? "",
        type: normalizedRole,
        dob: m.dob ?? undefined,
        email: m.email ?? undefined,
        phone: m.phone ?? undefined,
      };
    });
  }, [selectedTeamForEdit]);

  const handleSaveRoster = (members: RegistrationMember[]) => {
    if (!selectedTeamForEdit) {
      setRosterEditorOpen(false);
      return;
    }

    // Convert RegistrationMember[] to TeamMember[]
    const updatedMembers: TeamMember[] = members.map((m, idx) => ({
      id: `${selectedTeamForEdit.id}-member-${idx}`,
      name: m.name,
      firstName: m.name?.split(" ")[0] ?? null,
      lastName: m.name?.split(" ").slice(1).join(" ") ?? null,
      email: m.email ?? null,
      phone: m.phone ?? null,
      dob: m.dob ?? null,
      role: m.type ?? null,
    }));

    // Check if this is an added team or an original team
    const isAddedTeam = addedTeams.some((t) => t.id === selectedTeamForEdit.id);

    if (isAddedTeam) {
      // Update the added team's members directly
      setAddedTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeamForEdit.id
            ? { ...t, members: updatedMembers }
            : t,
        ),
      );
    } else {
      // Store the modified roster for the original team
      setModifiedRosters((prev) => {
        const next = new Map(prev);
        next.set(selectedTeamForEdit.id, updatedMembers);
        return next;
      });
    }

    toast.success("Roster updated", {
      description: `${selectedTeamForEdit.name} roster has been updated with ${members.length} member${members.length === 1 ? "" : "s"}.`,
    });

    setRosterEditorOpen(false);
    setSelectedTeamForEdit(null);
  };

  // Generate a new invoice number (incrementing version suffix)
  // Format: {6-digit-id}-{3-digit-version} e.g., 000014-001 → 000014-002
  const generateNewInvoiceNumber = () => {
    // Use the current invoice number (from saved changes if exists, otherwise from props)
    const currentInvoiceNumber =
      savedChanges?.newInvoice?.invoiceNumber ?? invoiceNumber;

    // Parse the invoice number format: {id}-{version}
    const versionMatch = currentInvoiceNumber.match(/^(.+)-(\d{3})$/);
    if (versionMatch && versionMatch[1] && versionMatch[2]) {
      const baseId = versionMatch[1];
      const currentVersion = parseInt(versionMatch[2], 10);
      const newVersion = String(currentVersion + 1).padStart(3, "0");
      return `${baseId}-${newVersion}`;
    }
    // Fallback: append -002 if format doesn't match (assumes -001 was original)
    return `${currentInvoiceNumber.replace(/-\d+$/, "")}-002`;
  };

  // Handle submit registration - save changes to localStorage
  const handleSubmitRegistration = () => {
    const newInvoiceNumber = generateNewInvoiceNumber();
    const now = new Date();
    const newInvoiceDate = now.toISOString();

    // Only set originalInvoice if it doesn't already exist (preserve the first invoice info)
    const originalInvoiceInfo = savedChanges?.originalInvoice ?? {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      total: invoiceTotal,
    };

    const success = saveChanges({
      addedTeams,
      removedTeamIds: Array.from(removedTeamIds),
      modifiedRosters: mapToRecord(modifiedRosters),
      newInvoice: {
        invoiceNumber: newInvoiceNumber,
        invoiceDate: newInvoiceDate,
        total: editModeInvoice.total,
      },
      originalInvoice: originalInvoiceInfo,
    });

    if (success) {
      toast.success("Registration updated", {
        description: `A new invoice (${newInvoiceNumber}) has been generated.`,
      });
      // Navigate back to the registration page (non-edit mode)
      router.push(`/clubs/registrations/${registration.id}`);
    } else {
      toast.error("Failed to save changes", {
        description: "Please try again.",
      });
    }
  };

  // Handle cancel/discard changes
  const handleDiscardChanges = () => {
    clearChanges();
    setAddedTeams([]);
    setRemovedTeamIds(new Set());
    setModifiedRosters(new Map());
    toast.success("Changes discarded", {
      description: "Your registration has been reset to its original state.",
    });
    router.push(`/clubs/registrations/${registration.id}`);
  };

  // Common sections
  const renderEventDetailsSection = (showDivider: boolean) => (
    <motion.div className="w-full" variants={fadeInUp}>
      <div className="flex flex-col gap-4 px-1">
        <div className="flex flex-col gap-4">
          {showDivider && <div className="h-px w-full bg-border" />}
          <div className="flex items-center justify-between gap-4">
            <p className="heading-4">Event Details</p>
            <Link
              href={eventPageHref}
              className="body-small inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              View Event Listing
              <ArrowUpRightIcon className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Row 1: Organizer */}
          <OrganizerCard
            name={organizerName}
            gradient={organizerGradientVariant}
            followers={organizerFollowersLabel}
            eventsCount={organizerEventsCount}
            hostingDuration={organizerHostingLabel}
          />

          {/* Row 2: Date & Location (combined) */}
          <div className="rounded-md border border-border/70 bg-card/60 p-5 transition-all hover:border-primary/20">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left: Date & Location Details */}
              <div className="flex flex-col gap-4">
                <p className="label text-muted-foreground">Date and Location</p>
                <div className="body-text flex flex-col gap-2.5 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <MapPinIcon
                      className="text-primary/70 size-5 shrink-0 translate-y-[2px]"
                      aria-hidden
                    />
                    <span className="text-foreground">{locationLabel}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDaysIcon
                      className="text-primary/70 size-5 shrink-0"
                      aria-hidden
                    />
                    <span className="text-foreground">
                      {eventDateLabel}
                      {eventDateWeekday ? `, ${eventDateWeekday}` : ""}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right: Map (3:2 aspect ratio) */}
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-border/70 bg-muted/50">
                {locationLabel &&
                locationLabel !== "Location to be announced" ? (
                  <>
                    <iframe
                      src={`https://www.google.com/maps?q=${encodeURIComponent(locationLabel)}&output=embed`}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${locationLabel}`}
                    />
                    <Link
                      href={googleMapsHref ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10"
                      aria-label={`Open ${locationLabel} in Google Maps`}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                    Location to be announced
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Documents & Resources section
  const DocumentsSection =
    documents.length > 0 ? (
      <motion.div className="w-full" variants={fadeInUp}>
        <div className="flex flex-col gap-4 px-1">
          <div className="h-px w-full bg-border" />
          <p className="heading-4">Documents & Resources</p>
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="rounded-md border border-border/70 bg-card/60 p-4 transition-all hover:border-primary/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <DownloadIcon className="text-primary/70 size-4 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    <Link href={doc.href}>Download</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    ) : null;

  // Convenience references for layouts
  const EventDetailsSection = renderEventDetailsSection(false);
  const EventDetailsSectionWithDivider = renderEventDetailsSection(true);

  // Registered Teams section for view mode
  const RegisteredTeamsSection = (
    <motion.div className="w-full" variants={fadeInUp}>
      <div className="flex flex-col gap-4 px-1">
        <div className="flex flex-col gap-4">
          {!isEditMode && <div className="h-px w-full bg-border" />}
          <div className="flex items-center justify-between">
            <p className="heading-4">Registered Teams</p>
            {isEditMode ? (
              // Edit mode: show Bulk Upload and Register Team buttons
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkUploadOpen(true)}
                >
                  <UploadIcon className="size-4" />
                  Bulk Upload
                </Button>
                <Button size="sm" onClick={() => setRegisterTeamOpen(true)}>
                  <PlusIcon className="size-4" />
                  Register Team
                </Button>
              </div>
            ) : isLocked ? (
              <span className="body-small inline-flex items-center gap-1.5 text-muted-foreground/50 cursor-not-allowed">
                Edit Registration
                <ArrowUpRightIcon className="size-3.5" aria-hidden />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setEditDialogOpen(true)}
                className="body-small inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                Edit Registration
                <ArrowUpRightIcon className="size-3.5" aria-hidden />
              </button>
            )}
          </div>
          {isEditMode ? (
            // Edit mode notice
            <div className="rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              You are editing your registration. Add or modify teams below, then
              changes will be reflected in a new invoice.
            </div>
          ) : savedChanges && editModeInvoice.hasChanges ? (
            // Stored changes notice (submitted changes persisted)
            <div className="flex items-start justify-between gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2Icon className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Registration updated</p>
                  <p className="text-green-700 dark:text-green-300">
                    Your changes have been saved. The invoice below reflects
                    your updates.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="text-xs font-medium text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100 underline"
              >
                Discard
              </button>
            </div>
          ) : isLocked ? (
            <div className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <LockIcon className="size-4 shrink-0 mt-0.5" />
              <p>
                The registration deadline has passed. Changes can no longer be
                made to teams.
              </p>
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
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          {allDivisions.map((division) => {
            const teamsInDivision = teamsByDivision.get(division) ?? [];
            return (
              <div key={division} className="flex flex-col gap-3 min-w-0">
                <p className="label text-muted-foreground">{division}</p>
                {teamsInDivision.length > 0 ? (
                  <div className="flex flex-col gap-3 min-w-0">
                    {teamsInDivision.map((card) => (
                      <TeamCard
                        key={card.id}
                        team={card}
                        isEditMode={isEditMode}
                        onEdit={handleEditTeam}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-[88px] items-center justify-center rounded-sm border border-dashed border-border/60 bg-muted/10 px-5 py-4">
                    <p className="text-sm text-muted-foreground">
                      No team registered for this division
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  // Check if we have stored changes that should be shown as an updated invoice
  const showUpdatedInvoice =
    !isEditMode && savedChanges && editModeInvoice.hasChanges;

  // Calculate refund amount if new total is less than original
  const refundAmount =
    showUpdatedInvoice && savedChanges?.originalInvoice
      ? savedChanges.originalInvoice.total - editModeInvoice.total
      : 0;
  const isRefund = refundAmount > 0;

  const CTASidebar = (
    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-4">
          {/* Main Invoice Card */}
          <Card className="border-border/70 bg-card py-6">
            <CardContent className="flex flex-col gap-4 px-6 py-0">
              {/* Invoice line items - show plain without change indicators */}
              {showUpdatedInvoice ? (
                <div className="flex flex-col gap-4">
                  {editModeInvoice.items
                    .filter((item) => !item.isRemoved)
                    .map((item) => (
                      <div key={item.id} className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.category}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(item.unit)} × {item.qty}
                          </span>
                          <span className="text-sm text-foreground">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {invoiceLineItems.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.category}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit)} × {item.qty}
                        </span>
                        <span className="text-sm text-foreground">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px w-full bg-border/60" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-sm text-foreground">
                    {formatCurrency(
                      showUpdatedInvoice ? editModeInvoice.subtotal : subtotal,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm text-foreground">
                    {formatCurrency(
                      showUpdatedInvoice ? editModeInvoice.tax : totalTax,
                    )}
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-border/60" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">
                  {formatCurrency(
                    showUpdatedInvoice ? editModeInvoice.total : invoiceTotal,
                  )}
                </span>
              </div>

              {/* Refund notice - only show for PAID events */}
              {showUpdatedInvoice && paymentStatus === "Paid" && isRefund && (
                <>
                  <div className="h-px w-full bg-border/60" />
                  <div className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Refund Due
                    </span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      -{formatCurrency(refundAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Event organizer will refund this amount.
                  </p>
                </>
              )}

              {/* Amount owed if total increased - only show for PAID events */}
              {showUpdatedInvoice &&
                paymentStatus === "Paid" &&
                !isRefund &&
                refundAmount < 0 && (
                  <>
                    <div className="h-px w-full bg-border/60" />
                    <div className="flex items-center justify-between rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Additional Amount
                      </span>
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        +{formatCurrency(Math.abs(refundAmount))}
                      </span>
                    </div>
                  </>
                )}

              <div className="h-px w-full bg-border/60" />

              {/* Determine effective payment status */}
              {(() => {
                // Only consider additional amount owed if the original invoice was PAID
                const isPaid = paymentStatus === "Paid";
                const hasAdditionalAmountOwed =
                  isPaid && showUpdatedInvoice && !isRefund && refundAmount < 0;
                const effectiveStatus = hasAdditionalAmountOwed
                  ? "Unpaid"
                  : paymentStatus;

                return (
                  <>
                    <WalkthroughSpotlight
                      step="pay-invoice"
                      side="left"
                      align="center"
                      advanceOnClick
                    >
                      <Button asChild className="w-full">
                        <Link href={invoiceHref}>
                          {effectiveStatus === "Paid"
                            ? "View Invoice"
                            : "Pay Invoice"}
                        </Link>
                      </Button>
                    </WalkthroughSpotlight>

                    {effectiveStatus !== "Paid" && paymentDeadlineLabel ? (
                      <p className="text-xs text-muted-foreground text-center">
                        Payment due by {paymentDeadlineLabel}
                      </p>
                    ) : effectiveStatus === "Paid" && paidAtLabel ? (
                      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                        Paid on {paidAtLabel}
                      </p>
                    ) : null}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );

  // Edit mode CTA sidebar - shows dynamic invoice based on added/removed teams
  const EditModeCTASidebar = (
    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Card className="border-border/70 bg-card py-6">
          <CardContent className="flex flex-col gap-4 px-6 py-0">
            <p className="label text-muted-foreground">
              {editModeInvoice.hasChanges
                ? "Updated Invoice"
                : "Invoice Summary"}
            </p>

            <div className="flex flex-col gap-4">
              {editModeInvoice.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col gap-1",
                    item.isRemoved && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium text-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {item.category}
                    </span>
                    {item.isNew && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                        New
                      </span>
                    )}
                    {item.isRemoved && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                        Removed
                      </span>
                    )}
                    {item.isModified && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                        Modified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm text-muted-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {formatCurrency(item.unit)} × {item.qty}
                      {item.isModified && item.originalQty !== undefined && (
                        <span className="ml-1 text-amber-600 dark:text-amber-400">
                          (was {item.originalQty})
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm text-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(editModeInvoice.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(editModeInvoice.tax)}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {editModeInvoice.hasChanges ? "New Total" : "Total"}
              </span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(editModeInvoice.total)}
              </span>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={!editModeInvoice.hasChanges}
                onClick={handleSubmitRegistration}
              >
                Submit Registration
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDiscardChanges}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Make changes to teams above, then submit to update your invoice.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const MobileStickyBar = (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            {paymentStatus === "Paid" ? (
              <div className="flex size-12 items-center justify-center rounded-md border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle2Icon className="size-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="flex w-12 flex-col items-center justify-center rounded-md border border-border bg-muted/50 py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {dueDateMonth ?? "---"}
                </span>
                <span className="text-base font-bold leading-none text-foreground">
                  {dueDateDay ?? "--"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {paymentTitle}
              </p>
              {paymentStatus === "Paid" && paidAtLabel ? (
                <p className="text-xs text-muted-foreground">
                  Paid · {paidAtLabel}
                </p>
              ) : paymentDeadlineLabel && paymentStatus !== "Paid" ? (
                <p className="text-xs text-muted-foreground">
                  Due {paymentDeadlineLabel}
                </p>
              ) : null}
            </div>
          </div>

          <Button asChild size="sm">
            <Link href={invoiceHref}>
              {paymentStatus === "Paid" ? "View Invoice" : "Pay Invoice"}
            </Link>
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </>
  );

  // Edit mode layout - simplified without event details
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

        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
            <motion.div
              className="space-y-8 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {RegisteredTeamsSection}
            </motion.div>
            {EditModeCTASidebar}
          </div>
        </div>

        {/* Mobile sticky bar for edit mode */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {editModeInvoice.hasChanges ? "New Total: " : "Total: "}
                {formatCurrency(editModeInvoice.total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {editModeInvoice.hasChanges
                  ? `${addedTeams.length > 0 ? `+${addedTeams.length} added` : ""}${addedTeams.length > 0 && removedTeamIds.size > 0 ? ", " : ""}${removedTeamIds.size > 0 ? `${removedTeamIds.size} removed` : ""}`
                  : "Review changes before submitting"}
              </p>
            </div>
            <Button
              size="sm"
              disabled={!editModeInvoice.hasChanges}
              onClick={handleSubmitRegistration}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="h-20 lg:hidden" />

        {/* Dialogs */}
        <BulkUploadDialog
          open={bulkUploadOpen}
          onOpenChange={setBulkUploadOpen}
          divisionPricing={divisionPricing}
          teamOptions={teamOptions}
          onImport={handleBulkImport}
        />
        <RegisterTeamModal
          open={registerTeamOpen}
          onOpenChange={setRegisterTeamOpen}
          divisions={allDivisions}
          teams={teamOptions}
          onSubmit={handleRegisterTeam}
        />
        <RosterEditorDialog
          open={rosterEditorOpen}
          onOpenChange={(open) => {
            setRosterEditorOpen(open);
            if (!open) setSelectedTeamForEdit(null);
          }}
          members={selectedTeamMembers}
          teamName={selectedTeamForEdit?.name ?? "Team"}
          onSave={handleSaveRoster}
          onDeleteTeam={
            selectedTeamForEdit
              ? () => handleRemoveTeam(selectedTeamForEdit.id)
              : undefined
          }
        />
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title={registration.eventName}
        gradient={organizerGradientVariant}
        dateLabel={eventDateLabel}
        topRightAction={
          <LayoutToggle
            variants={["A", "B", "C"] as const}
            value={layoutVariant}
            onChange={setLayoutVariant}
            storageKey={LAYOUT_TUTORIAL_STORAGE_KEY}
            tutorialItems={LAYOUT_TUTORIAL_ITEMS}
          />
        }
      />

      {layoutVariant === "A" ? (
        // LAYOUT A: Two-column with CTA sidebar
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
              <motion.div
                className="space-y-12 min-w-0"
                variants={staggerSections}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {EventDetailsSection}
                {DocumentsSection}
                {RegisteredTeamsSection}
              </motion.div>
              {CTASidebar}
            </div>
          </div>
          {MobileStickyBar}
        </>
      ) : layoutVariant === "B" ? (
        // LAYOUT B: Single column with top payment notice + buttons
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            {/* Top payment notice banner */}
            <motion.div
              className="mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <RegistrationPaymentCTA
                status={
                  paymentStatus.toLowerCase() as "paid" | "unpaid" | "overdue"
                }
                amountLabel={invoiceTotalLabel}
                dueLabel={paymentDeadlineLabel}
                paidAtLabel={paidAtLabel ?? undefined}
                invoiceHref={invoiceHref}
              />
            </motion.div>

            <motion.div
              className="space-y-12 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {EventDetailsSectionWithDivider}
              {DocumentsSection}
              {RegisteredTeamsSection}
            </motion.div>
          </div>
          {MobileStickyBar}
        </>
      ) : (
        // LAYOUT C: Single column with quick action row + simple notice (no buttons)
        <>
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8 min-w-0">
            {/* Quick action buttons row */}
            <motion.div
              className="mb-4 flex flex-wrap items-center gap-2"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Button asChild variant="outline" size="sm">
                <Link href={invoiceHref}>View Invoice</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={eventPageHref}>View Event Listing</Link>
              </Button>
              {isLocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  Edit Registration
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit Registration
                </Button>
              )}
            </motion.div>

            {/* Simple payment notice (no buttons) */}
            <motion.div
              className="mb-8"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <RegistrationPaymentCTA
                status={
                  paymentStatus.toLowerCase() as "paid" | "unpaid" | "overdue"
                }
                amountLabel={invoiceTotalLabel}
                dueLabel={paymentDeadlineLabel}
                paidAtLabel={paidAtLabel ?? undefined}
                invoiceHref={invoiceHref}
                hideButtons
              />
            </motion.div>

            <motion.div
              className="space-y-12 min-w-0"
              variants={staggerSections}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {EventDetailsSectionWithDivider}
              {DocumentsSection}
              {RegisteredTeamsSection}
            </motion.div>
          </div>
          {/* No mobile sticky bar for Layout C - actions are in quick buttons */}
        </>
      )}

      {/* Edit Registration Confirmation Dialog */}
      <EditRegistrationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        registrationId={registration.id}
      />
    </section>
  );
}
