"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@workspace/ui/shadcn/sonner";

import {
  useRegistrationStorage,
  mapToRecord,
  recordToMap,
} from "@/hooks/useRegistrationStorage";
import type { TeamMember } from "@/components/features/clubs/TeamCard";
import type {
  RegistrationMember,
  RegistrationEntry,
} from "@/components/features/registration/flow/types";
import { DEFAULT_ROLE } from "@/components/features/registration/flow/types";

import type {
  RegisteredTeamData,
  InvoiceLineItem,
  DivisionPricingProp,
  TeamOption,
  TeamRosterData,
  EditModeInvoice,
  EditModeLineItem,
} from "./types";

type UseRegistrationEditProps = {
  registrationId: string;
  isEditMode: boolean;
  teamsByDivisionArray: [string, RegisteredTeamData[]][];
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceNumber: string;
  invoiceDate: string;
  divisionPricing: DivisionPricingProp[];
  teamOptions: TeamOption[];
  teamRosters: TeamRosterData[];
};

export function useRegistrationEdit({
  registrationId,
  isEditMode,
  teamsByDivisionArray,
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceNumber,
  invoiceDate,
  divisionPricing,
  teamOptions,
  teamRosters,
}: UseRegistrationEditProps) {
  const router = useRouter();

  // Track teams added/removed in edit mode
  const [addedTeams, setAddedTeams] = useState<RegisteredTeamData[]>([]);
  const [removedTeamIds, setRemovedTeamIds] = useState<Set<string>>(new Set());
  // Track roster modifications for original teams (teamId -> modified members)
  const [modifiedRosters, setModifiedRosters] = useState<
    Map<string, TeamMember[]>
  >(new Map());

  // Persistent storage for registration changes
  const { isLoaded, savedChanges, saveChanges, clearChanges } =
    useRegistrationStorage(registrationId);

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
  const editModeInvoice: EditModeInvoice = useMemo(() => {
    const items: EditModeLineItem[] = [];

    // Add original line items with removed status and roster modifications
    invoiceLineItems.forEach((item, index) => {
      // Find which team this line item belongs to by matching division name
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
    const taxRate = subtotal > 0 ? totalTax / subtotal : 0.15;
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
      return false;
    }

    const newTeams: RegisteredTeamData[] = uniqueEntries.map((entry) => {
      const existingTeam = entry.teamId
        ? teamOptions.find((t) => t.id === entry.teamId)
        : null;
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

    return true;
  };

  const handleRegisterTeam = (entry: RegistrationEntry) => {
    const checkId = entry.teamId ?? entry.id;

    if (isTeamAlreadyRegistered(checkId)) {
      toast.error("Team already registered", {
        description: `${entry.teamName ?? "This team"} is already in your registration.`,
      });
      return false;
    }

    const existingTeam = entry.teamId
      ? teamOptions.find((t) => t.id === entry.teamId)
      : null;
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

    toast.success("Team added", {
      description: `${newTeam.name} has been added to ${entry.division}.`,
    });

    return true;
  };

  // Handle team removal with undo support
  const handleRemoveTeam = (teamId: string) => {
    const addedTeam = addedTeams.find((t) => t.id === teamId);
    if (addedTeam) {
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
      setRemovedTeamIds((prev) => new Set([...prev, teamId]));

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

  // Convert team members to RegistrationMember format for editor
  const getTeamMembersForEditor = (
    team: RegisteredTeamData | null,
  ): RegistrationMember[] => {
    if (!team?.members) return [];
    return team.members.map((m) => {
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
  };

  const handleSaveRoster = (
    team: RegisteredTeamData,
    members: RegistrationMember[],
  ) => {
    // Convert RegistrationMember[] to TeamMember[]
    const updatedMembers: TeamMember[] = members.map((m, idx) => ({
      id: `${team.id}-member-${idx}`,
      name: m.name,
      firstName: m.name?.split(" ")[0] ?? null,
      lastName: m.name?.split(" ").slice(1).join(" ") ?? null,
      email: m.email ?? null,
      phone: m.phone ?? null,
      dob: m.dob ?? null,
      role: m.type ?? null,
    }));

    const isAddedTeam = addedTeams.some((t) => t.id === team.id);

    if (isAddedTeam) {
      setAddedTeams((prev) =>
        prev.map((t) =>
          t.id === team.id ? { ...t, members: updatedMembers } : t,
        ),
      );
    } else {
      setModifiedRosters((prev) => {
        const next = new Map(prev);
        next.set(team.id, updatedMembers);
        return next;
      });
    }

    toast.success("Roster updated", {
      description: `${team.name} roster has been updated with ${members.length} member${members.length === 1 ? "" : "s"}.`,
    });
  };

  // Generate a new invoice number
  const generateNewInvoiceNumber = () => {
    const currentInvoiceNumber =
      savedChanges?.newInvoice?.invoiceNumber ?? invoiceNumber;

    const versionMatch = currentInvoiceNumber.match(/^(.+)-(\d{3})$/);
    if (versionMatch && versionMatch[1] && versionMatch[2]) {
      const baseId = versionMatch[1];
      const currentVersion = parseInt(versionMatch[2], 10);
      const newVersion = String(currentVersion + 1).padStart(3, "0");
      return `${baseId}-${newVersion}`;
    }
    return `${currentInvoiceNumber.replace(/-\d+$/, "")}-002`;
  };

  // Handle submit registration
  const handleSubmitRegistration = () => {
    const newInvoiceNumber = generateNewInvoiceNumber();
    const now = new Date();
    const newInvoiceDate = now.toISOString();

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
      router.push(`/clubs/registrations/${registrationId}`);
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
    router.push(`/clubs/registrations/${registrationId}`);
  };

  return {
    // State
    addedTeams,
    removedTeamIds,
    teamsByDivision,
    editModeInvoice,
    savedChanges,
    // Handlers
    handleBulkImport,
    handleRegisterTeam,
    handleRemoveTeam,
    handleSaveRoster,
    handleSubmitRegistration,
    handleDiscardChanges,
    getTeamMembersForEditor,
  };
}
