"use client";

/**
 * NewRegistrationContent
 *
 * Purpose
 * - Client-side flow for registering teams to an event with a two-column layout.
 * - Matches the RegistrationDetailContent edit mode UI pattern.
 *
 * Structure
 * - Left column: Teams section with division groupings
 * - Right column: Invoice summary sidebar with dynamic totals
 * - Mobile: Sticky footer with total and submit button
 */
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { toast } from "@workspace/ui/shadcn/sonner";

import { motion } from "framer-motion";
import { PlusIcon, UploadIcon } from "lucide-react";

import { fadeInUp } from "@/lib/animations";
import {
  TeamCard,
  type TeamData,
  type TeamMember,
} from "@/components/features/clubs/TeamCard";
import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { RegisterTeamModal } from "@/components/features/registration/flow/RegisterTeamModal";
import { RosterEditorDialog } from "@/components/features/registration/flow/RosterEditorDialog";
import { WalkthroughSpotlight } from "@/components/ui/RegistrationWalkthrough";
import { formatCurrency } from "@/utils/format";
import { saveNewRegistration } from "@/hooks/useNewRegistrationStorage";
import { useAuth } from "@/components/providers/AuthProvider";
import { useClubData } from "@/hooks/useClubData";

import type {
  RegistrationEntry,
  RegistrationMember,
  TeamOption,
} from "./types";
import type { DivisionPricing } from "@/types/events";
import type { TeamRoster } from "@/types/club";

// Registration-specific team data (TeamData with required detailId)
type RegisteredTeamData = TeamData & { detailId: string };

type InvoiceLineItem = {
  id: string;
  division: string;
  teamCount: number;
  memberCount: number;
  unitPrice: number;
  lineTotal: number;
};

export type NewRegistrationContentProps = {
  eventId: string;
  eventName: string;
  organizer: string;
  organizerGradient?: string;
  eventDate: string;
  location: string;
  divisionPricing: DivisionPricing[];
  teams: TeamOption[];
  rosters?: TeamRoster[];
  registrationDeadline?: string;
  confirmationPath?: string;
};

const TAX_RATE = 0.15; // 15% tax rate

export function NewRegistrationContent({
  eventId,
  eventName,
  organizer,
  organizerGradient,
  eventDate,
  location,
  divisionPricing,
  teams: serverTeams,
  rosters: serverRosters = [],
  registrationDeadline,
  confirmationPath,
}: NewRegistrationContentProps) {
  const router = useRouter();

  // Get client-side user data (for logged-in users)
  const { user } = useAuth();
  const { data: clubData } = useClubData(user?.id);

  // Use client-side data if available, otherwise fall back to server props
  const teams = useMemo(() => {
    if (clubData?.teams && clubData.teams.length > 0) {
      return clubData.teams.map(({ id, name, division, size }) => ({
        id,
        name,
        division,
        size,
      }));
    }
    return serverTeams;
  }, [clubData?.teams, serverTeams]);

  const rosters = useMemo(() => {
    if (clubData?.rosters && clubData.rosters.length > 0) {
      return clubData.rosters;
    }
    return serverRosters;
  }, [clubData?.rosters, serverRosters]);

  // State for registered teams
  const [registeredTeams, setRegisteredTeams] = useState<RegisteredTeamData[]>(
    [],
  );

  // Dialog states
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [registerTeamOpen, setRegisterTeamOpen] = useState(false);
  const [rosterEditorOpen, setRosterEditorOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] =
    useState<RegisteredTeamData | null>(null);

  // Get all available divisions from pricing
  const allDivisions = useMemo(
    () =>
      Array.from(new Set(divisionPricing.map((d) => d.name))).filter(Boolean),
    [divisionPricing],
  );

  // Group teams by division
  const teamsByDivision = useMemo(() => {
    const grouped = new Map<string, RegisteredTeamData[]>();
    registeredTeams.forEach((team) => {
      const existing = grouped.get(team.division) ?? [];
      grouped.set(team.division, [...existing, team]);
    });
    return grouped;
  }, [registeredTeams]);

  // Get roster data for a team
  const getRosterForTeam = useCallback(
    (teamId: string): TeamMember[] => {
      const roster = rosters.find((r) => r.teamId === teamId);
      if (!roster) return [];

      return [
        ...roster.coaches.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          role: "Coach" as const,
        })),
        ...roster.athletes.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          role: "Athlete" as const,
        })),
        ...roster.reservists.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          role: "Reservist" as const,
        })),
        ...roster.chaperones.map((p) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`.trim(),
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email,
          phone: p.phone,
          dob: p.dob,
          role: "Chaperone" as const,
        })),
      ];
    },
    [rosters],
  );

  // Compute invoice line items
  const invoiceData = useMemo(() => {
    const lineItemsByDivision = new Map<string, InvoiceLineItem>();

    registeredTeams.forEach((team) => {
      const existing = lineItemsByDivision.get(team.division);
      const pricing = divisionPricing.find((d) => d.name === team.division);
      const unitPrice =
        pricing?.regular?.price ?? pricing?.earlyBird?.price ?? 0;
      const memberCount = team.members?.length ?? 0;

      if (existing) {
        existing.teamCount += 1;
        existing.memberCount += memberCount;
        existing.lineTotal += unitPrice * memberCount;
      } else {
        lineItemsByDivision.set(team.division, {
          id: team.division,
          division: team.division,
          teamCount: 1,
          memberCount,
          unitPrice,
          lineTotal: unitPrice * memberCount,
        });
      }
    });

    const items = Array.from(lineItemsByDivision.values());
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { items, subtotal, tax, total };
  }, [registeredTeams, divisionPricing]);

  // Check if a team is already registered
  const isTeamAlreadyRegistered = useCallback(
    (teamId: string) => {
      return registeredTeams.some(
        (t) => t.id === teamId || t.detailId === teamId,
      );
    },
    [registeredTeams],
  );

  // Handle adding a team from RegisterTeamModal
  const handleRegisterTeam = useCallback(
    (entry: RegistrationEntry) => {
      const checkId = entry.teamId ?? entry.id;

      if (isTeamAlreadyRegistered(checkId)) {
        toast.error("Team already registered", {
          description: `${entry.teamName ?? "This team"} is already in your registration.`,
        });
        setRegisterTeamOpen(false);
        return;
      }

      const existingTeam = entry.teamId
        ? teams.find((t) => t.id === entry.teamId)
        : null;
      const rosterMembers = entry.teamId ? getRosterForTeam(entry.teamId) : [];

      const newTeam: RegisteredTeamData = {
        id: entry.teamId ?? entry.id,
        name: entry.teamName ?? existingTeam?.name ?? "New Team",
        division: entry.division,
        members: rosterMembers,
        detailId: entry.teamId ?? entry.id,
      };

      setRegisteredTeams((prev) => [...prev, newTeam]);
      setRegisterTeamOpen(false);

      toast.success("Team added", {
        description: `${newTeam.name} has been added to ${entry.division}.`,
      });
    },
    [isTeamAlreadyRegistered, teams, getRosterForTeam],
  );

  // Handle bulk import
  const handleBulkImport = useCallback(
    (entries: RegistrationEntry[]) => {
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
        const existingTeam = entry.teamId
          ? teams.find((t) => t.id === entry.teamId)
          : null;
        const rosterMembers = entry.teamId
          ? getRosterForTeam(entry.teamId)
          : [];

        return {
          id: entry.teamId ?? entry.id,
          name: entry.teamName ?? existingTeam?.name ?? "Imported Team",
          division: entry.division,
          members: rosterMembers,
          detailId: entry.teamId ?? entry.id,
        };
      });

      setRegisteredTeams((prev) => [...prev, ...newTeams]);
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
    },
    [isTeamAlreadyRegistered, teams, getRosterForTeam],
  );

  // Handle team removal
  const handleRemoveTeam = useCallback(
    (teamId: string) => {
      const removedTeam = registeredTeams.find((t) => t.id === teamId);
      if (!removedTeam) return;

      setRegisteredTeams((prev) => prev.filter((t) => t.id !== teamId));

      toast.success("Team removed", {
        description: `${removedTeam.name} has been removed from your registration.`,
        action: {
          label: "Undo",
          onClick: () => {
            setRegisteredTeams((prev) => [...prev, removedTeam]);
            toast.success("Team restored", {
              description: `${removedTeam.name} has been added back.`,
            });
          },
        },
      });
    },
    [registeredTeams],
  );

  // Handle team edit (open roster editor)
  const handleEditTeam = useCallback((team: TeamData) => {
    // Cast to RegisteredTeamData since we know detailId exists in this context
    setSelectedTeamForEdit(team as RegisteredTeamData);
    setRosterEditorOpen(true);
  }, []);

  // Convert team members to RegistrationMember format for editor
  const selectedTeamMembers: RegistrationMember[] = useMemo(() => {
    if (!selectedTeamForEdit?.members) return [];
    return selectedTeamForEdit.members.map((m) => ({
      name: m.name ?? [m.firstName, m.lastName].filter(Boolean).join(" ") ?? "",
      type: m.role ?? "Athlete",
      dob: m.dob ?? undefined,
      email: m.email ?? undefined,
      phone: m.phone ?? undefined,
    }));
  }, [selectedTeamForEdit]);

  // Handle roster save
  const handleSaveRoster = useCallback(
    (members: RegistrationMember[]) => {
      if (!selectedTeamForEdit) {
        setRosterEditorOpen(false);
        return;
      }

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

      setRegisteredTeams((prev) =>
        prev.map((t) =>
          t.id === selectedTeamForEdit.id
            ? { ...t, members: updatedMembers }
            : t,
        ),
      );

      toast.success("Roster updated", {
        description: `${selectedTeamForEdit.name} roster has been updated with ${members.length} member${members.length === 1 ? "" : "s"}.`,
      });

      setRosterEditorOpen(false);
      setSelectedTeamForEdit(null);
    },
    [selectedTeamForEdit],
  );

  // Handle registration submission
  const handleSubmitRegistration = useCallback(() => {
    if (registeredTeams.length === 0) {
      toast.error("No teams registered", {
        description: "Please add at least one team before submitting.",
      });
      return;
    }

    // Save registration to localStorage
    const savedRegistration = saveNewRegistration(
      {
        eventId,
        eventName,
        organizer,
        organizerGradient,
        eventDate,
        location,
        registrationDeadline,
      },
      registeredTeams,
      {
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
      },
    );

    if (!savedRegistration) {
      toast.error("Failed to save registration", {
        description: "Please try again.",
      });
      return;
    }

    toast.success("Registration submitted", {
      description: `${registeredTeams.length} team${registeredTeams.length === 1 ? "" : "s"} registered for ${eventName}.`,
    });

    // Navigate to the confirmation page with the registration ID
    const redirectPath =
      confirmationPath ??
      `/events/${encodeURIComponent(eventId)}/register/confirmation?registrationId=${encodeURIComponent(savedRegistration.id)}`;
    router.push(redirectPath);
  }, [
    registeredTeams,
    eventName,
    eventId,
    organizer,
    organizerGradient,
    eventDate,
    location,
    registrationDeadline,
    invoiceData,
    confirmationPath,
    router,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    router.push(`/events/${encodeURIComponent(eventId)}`);
  }, [eventId, router]);

  // Teams section
  const TeamsSection = (
    <motion.div
      className="w-full"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Top border divider */}
      <div className="h-px w-full bg-border" />

      <div className="flex flex-col gap-6 py-8">
        {/* Section header with title and actions */}
        <div className="flex items-center justify-between">
          <p className="heading-4">Register Teams</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkUploadOpen(true)}
            >
              <UploadIcon className="size-4" />
              Bulk Upload
            </Button>
            <WalkthroughSpotlight
              step="register-team"
              side="bottom"
              align="end"
              advanceOnClick
            >
              <Button size="sm" onClick={() => setRegisterTeamOpen(true)}>
                <PlusIcon className="size-4" />
                Register Team
              </Button>
            </WalkthroughSpotlight>
          </div>
        </div>

        {/* Informational notice */}
        <div className="rounded-md border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Add teams to register for this event.
          {registrationDeadline ? (
            <>
              {" "}
              Registration must be completed before{" "}
              <span className="font-medium text-foreground">
                {registrationDeadline}
              </span>
              .
            </>
          ) : null}
        </div>

        {/* Division groups */}
        <div className="flex flex-col gap-6 min-w-0">
          {allDivisions.length > 0 ? (
            allDivisions.map((division) => {
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
                          isEditMode
                          onEdit={handleEditTeam}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[88px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/10 px-5 py-4">
                      <p className="text-sm text-muted-foreground">
                        No team registered for this division
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/10 px-5 py-4">
              <p className="text-sm text-muted-foreground">
                No divisions available for this event
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Invoice sidebar card
  const InvoiceSidebar = (
    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Card className="border-border/70 bg-card py-6">
          <CardContent className="flex flex-col gap-4 px-6 py-0">
            <p className="label text-muted-foreground">Invoice Summary</p>

            {invoiceData.items.length > 0 ? (
              <div className="flex flex-col gap-4">
                {invoiceData.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {item.division}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.teamCount} team{item.teamCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.memberCount}
                      </span>
                      <span className="text-sm text-foreground">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[88px] items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/10 px-5 py-4 text-sm text-muted-foreground">
                Add teams to see pricing
              </div>
            )}

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(invoiceData.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tax (15%)</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(invoiceData.tax)}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(invoiceData.total)}
              </span>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <WalkthroughSpotlight
                step="submit-registration"
                side="left"
                align="center"
                advanceOnClick
              >
                <Button
                  className="w-full"
                  disabled={registeredTeams.length === 0}
                  onClick={handleSubmitRegistration}
                >
                  Submit Registration
                </Button>
              </WalkthroughSpotlight>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Add teams above, then submit to complete your registration.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Mobile sticky footer
  const MobileStickyFooter = (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-md backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {registeredTeams.length} team
              {registeredTeams.length === 1 ? "" : "s"} ·{" "}
              {formatCurrency(invoiceData.total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {registeredTeams.length === 0
                ? "Add teams to register"
                : "Ready to submit"}
            </p>
          </div>
          <Button
            size="sm"
            disabled={registeredTeams.length === 0}
            onClick={handleSubmitRegistration}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </>
  );

  return (
    <>
      <div className="min-w-0">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] min-w-0">
          <div className="space-y-8 min-w-0">{TeamsSection}</div>
          {InvoiceSidebar}
        </div>
      </div>

      {MobileStickyFooter}

      {/* Dialogs */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        divisionPricing={divisionPricing}
        teamOptions={teams}
        onImport={handleBulkImport}
      />
      <RegisterTeamModal
        open={registerTeamOpen}
        onOpenChange={setRegisterTeamOpen}
        divisions={allDivisions}
        teams={teams}
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
    </>
  );
}
