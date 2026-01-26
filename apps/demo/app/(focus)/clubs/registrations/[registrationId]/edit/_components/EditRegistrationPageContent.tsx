"use client";

/**
 * EditRegistrationPageContent
 *
 * Client component that fetches registration data and renders the
 * EditRegistrationContent component in focus mode layout.
 *
 * Handles the focus mode header with back button interception for unsaved changes.
 */

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { RegistrationFocusHeader } from "@/components/layout/RegistrationFocusHeader";
import { EditRegistrationContent } from "@/components/features/clubs/registration-detail/EditRegistrationContent";
import { UnsavedRegistrationChangesModal } from "@/components/features/clubs/registration-detail/UnsavedRegistrationChangesModal";
import { RegistrationDetailSkeleton } from "@/components/ui";
import {
  useUnifiedClubData,
  getRegistrationById,
  getLocalStorageRegistration,
} from "@/hooks/useUnifiedClubData";
import { findEventById } from "@/data/events";
import { demoRosters } from "@/data/clubs/members";
import { formatFriendlyDate } from "@/utils/format";
import { isRegistrationLocked } from "@/utils/registrations";
import {
  buildInvoiceDataFromEntries,
  buildInvoiceTeamEntries,
  calculateInvoiceTotals,
  convertInvoiceTeamsToRegistrationEntries,
} from "@/lib/invoices";
import type { RegisteredMemberDTO } from "@/lib/club-data";
import type {
  TeamMember,
  TeamData,
} from "@/components/features/clubs/TeamCard";

type EditRegistrationPageContentProps = {
  registrationId: string;
  eventName: string;
};

// Registration-specific team data (TeamData with required detailId)
type RegisteredTeamData = TeamData & { detailId: string };

function normalizeRegisteredMembers(
  members?: RegisteredMemberDTO[] | null,
): TeamMember[] {
  if (!members?.length) return [];
  return members.map((member, index) => ({
    id: member.personId ?? member.id ?? `registered-member-${index}`,
    name:
      `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() || undefined,
    firstName: member.firstName ?? null,
    lastName: member.lastName ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    dob: member.dob ?? null,
    role: member.role ?? null,
  }));
}

export function EditRegistrationPageContent({
  registrationId,
  eventName,
}: EditRegistrationPageContentProps) {
  const router = useRouter();
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const hasChangesRef = useRef(false);

  const { data, isLoading, error } = useUnifiedClubData();

  // Find the registration in unified data
  const registration = useMemo(() => {
    if (!data) return null;
    return getRegistrationById(data.registrations, registrationId);
  }, [data, registrationId]);

  // Check if this is a localStorage registration
  const localStorageReg = useMemo(() => {
    return getLocalStorageRegistration(registrationId);
  }, [registrationId]);

  // Redirect if registration not found after loading
  useEffect(() => {
    if (!isLoading && !registration) {
      router.push("/clubs/registrations");
    }
  }, [isLoading, registration, router]);

  // Handle back button - check for unsaved changes
  const handleBack = useCallback(() => {
    if (hasChangesRef.current) {
      setShowUnsavedModal(true);
    } else {
      router.push(`/clubs/registrations/${registrationId}`);
    }
  }, [router, registrationId]);

  // Handle discard and navigate back
  const handleDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    router.push(`/clubs/registrations/${registrationId}`);
  }, [router, registrationId]);

  // Handle keep editing (close modal)
  const handleKeepEditing = useCallback(() => {
    setShowUnsavedModal(false);
  }, []);

  // Callback to receive hasChanges updates from child
  const handleUnsavedChangesUpdate = useCallback((hasChanges: boolean) => {
    hasChangesRef.current = hasChanges;
  }, []);

  if (isLoading) {
    return (
      <>
        <RegistrationFocusHeader
          title={eventName}
          backHref={`/clubs/registrations/${registrationId}`}
          onBack={handleBack}
        />
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:px-8">
          <RegistrationDetailSkeleton />
        </section>
      </>
    );
  }

  if (error || !data || !registration) {
    return null; // Will redirect
  }

  const clubLabel = "Demo Club Owner's Club";

  // Get event data
  const event = findEventById(registration.eventId);

  // Build invoice data
  let invoiceLineItems: {
    category: string;
    unit: number;
    qty: number;
    lineTotal: number;
  }[];
  let subtotal: number;
  let totalTax: number;
  let computedInvoiceTotal: number;

  if (localStorageReg) {
    // Use localStorage invoice data directly
    subtotal = localStorageReg.subtotal;
    totalTax = localStorageReg.tax;
    computedInvoiceTotal = localStorageReg.total;

    // Build line items from teams
    const teamsByDivision = new Map<string, typeof localStorageReg.teams>();
    localStorageReg.teams.forEach((team) => {
      const existing = teamsByDivision.get(team.division) ?? [];
      existing.push(team);
      teamsByDivision.set(team.division, existing);
    });

    const divisionPricing = event?.availableDivisions ?? [];
    invoiceLineItems = Array.from(teamsByDivision.entries()).map(
      ([division, teams]) => {
        const memberCount = teams.reduce(
          (sum, t) => sum + (t.members?.length ?? 0),
          0,
        );
        const pricing = divisionPricing.find((d) => d.name === division);
        const unitPrice =
          pricing?.regular?.price ?? pricing?.earlyBird?.price ?? 130;
        return {
          category: division,
          unit: unitPrice,
          qty: memberCount,
          lineTotal: unitPrice * memberCount,
        };
      },
    );
  } else {
    // Use demo data invoice calculation
    const invoiceTeamEntries = buildInvoiceTeamEntries(
      data,
      registration.eventId,
      event,
      { scope: "event" },
    );
    const invoiceEntries =
      convertInvoiceTeamsToRegistrationEntries(invoiceTeamEntries);
    const invoiceData = buildInvoiceDataFromEntries(
      invoiceEntries,
      registration,
      event ?? null,
      data,
      {
        clubName: clubLabel,
      },
    );
    const invoiceTotals = calculateInvoiceTotals(invoiceData);
    invoiceLineItems = invoiceTotals.lineItems;
    subtotal = invoiceTotals.subtotal;
    totalTax = invoiceTotals.totalTax;
    computedInvoiceTotal = invoiceTotals.total;
  }

  // Build registered team cards
  let registeredTeamCards: RegisteredTeamData[];

  if (localStorageReg) {
    registeredTeamCards = localStorageReg.teams.map((team) => ({
      id: team.id,
      name: team.name,
      division: team.division,
      members: team.members?.map((m, idx) => ({
        id: m.id || `member-${idx}`,
        name: m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        firstName: m.firstName || null,
        lastName: m.lastName || null,
        email: m.email || null,
        phone: m.phone || null,
        dob: m.dob || null,
        role: m.role || null,
      })),
      detailId: team.teamId,
    }));
  } else {
    const invoiceTeamEntries = buildInvoiceTeamEntries(
      data,
      registration.eventId,
      event,
      { scope: "event" },
    );
    registeredTeamCards = invoiceTeamEntries.map((entry) => ({
      id: entry.id,
      name: entry.teamName ?? "Registered Team",
      division: entry.division,
      members: normalizeRegisteredMembers(entry.members),
      detailId: entry.teamId ?? entry.registeredTeamId ?? entry.id,
    }));
  }

  // Group registered teams by division
  const teamsByDivision = new Map<string, RegisteredTeamData[]>();
  registeredTeamCards.forEach((card) => {
    const existing = teamsByDivision.get(card.division) ?? [];
    existing.push(card);
    teamsByDivision.set(card.division, existing);
  });

  // Get all available divisions
  const availableDivisions =
    event?.availableDivisions?.map((d) => d.name) ??
    Array.from(teamsByDivision.keys());
  const allDivisions = [
    ...new Set([...availableDivisions, ...Array.from(teamsByDivision.keys())]),
  ];

  const fallbackInvoiceTotal = Number(registration.invoiceTotal ?? 0);
  const invoiceTotalNumber =
    Number.isFinite(computedInvoiceTotal) && computedInvoiceTotal > 0
      ? computedInvoiceTotal
      : fallbackInvoiceTotal;

  // Invoice info
  const invoiceNumber = localStorageReg
    ? localStorageReg.invoiceNumber
    : registration.id.replace("r-", "").padStart(6, "0") + "-001";
  const invoiceDate = localStorageReg
    ? localStorageReg.invoiceDate
    : registration.snapshotTakenAt || registration.eventDate;

  // Registration deadline
  const registrationDeadlineLabel = registration.registrationDeadline
    ? formatFriendlyDate(registration.registrationDeadline)
    : null;

  // Lock status
  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    registrationDeadline: registration.registrationDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  });

  // Division pricing and team options for edit mode
  const divisionPricing = event?.availableDivisions ?? [];
  const teamOptions = (data.teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    division: team.division ?? undefined,
    size: team.size,
  }));

  // Build roster data for team lookups
  const teamRosters = demoRosters.map((roster) => ({
    teamId: roster.teamId,
    members: [
      ...roster.coaches.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? null,
        phone: p.phone ?? null,
        dob: p.dob ?? null,
        role: "Coach" as const,
      })),
      ...roster.athletes.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? null,
        phone: p.phone ?? null,
        dob: p.dob ?? null,
        role: "Athlete" as const,
      })),
      ...roster.reservists.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? null,
        phone: p.phone ?? null,
        dob: p.dob ?? null,
        role: "Reservist" as const,
      })),
      ...roster.chaperones.map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email ?? null,
        phone: p.phone ?? null,
        dob: p.dob ?? null,
        role: "Chaperone" as const,
      })),
    ],
  }));

  // Convert Map to serializable format
  const teamsByDivisionArray = Array.from(teamsByDivision.entries());

  return (
    <>
      <RegistrationFocusHeader
        title={eventName}
        backHref={`/clubs/registrations/${registrationId}`}
        onBack={handleBack}
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 lg:px-8">
        <EditRegistrationContent
          registrationId={registrationId}
          eventName={registration.eventName}
          allDivisions={allDivisions}
          teamsByDivisionArray={teamsByDivisionArray}
          invoiceLineItems={invoiceLineItems}
          subtotal={subtotal}
          totalTax={totalTax}
          invoiceTotal={invoiceTotalNumber}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          divisionPricing={divisionPricing}
          teamOptions={teamOptions}
          teamRosters={teamRosters}
          registrationDeadlineLabel={registrationDeadlineLabel}
          isLocked={isLocked}
          onUnsavedChangesBack={handleUnsavedChangesUpdate}
        />
      </section>

      {/* Unsaved changes confirmation modal */}
      <UnsavedRegistrationChangesModal
        open={showUnsavedModal}
        onOpenChange={setShowUnsavedModal}
        onDiscard={handleDiscard}
        onKeepEditing={handleKeepEditing}
      />
    </>
  );
}
