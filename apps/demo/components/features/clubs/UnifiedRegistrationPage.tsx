"use client";

/**
 * UnifiedRegistrationPage
 *
 * Client component that renders registration details for both demo and
 * localStorage-based registrations using a unified data layer.
 * No special handling needed - all registrations work the same way.
 */

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  RegistrationDetailContent,
  type TeamRosterData,
} from "@/components/features/clubs/RegistrationDetailContent";
import { RegistrationDetailSkeleton } from "@/components/ui";
import {
  useUnifiedClubData,
  getRegistrationById,
  getLocalStorageRegistration,
} from "@/hooks/useUnifiedClubData";
import { findEventById, listEvents, organizers } from "@/data/events";
import { buildEventGalleryImages } from "@/app/(events)/events/[eventId]/image-gallery";
import { demoRosters } from "@/data/clubs/members";
import { formatCurrency, formatFriendlyDate } from "@/utils/format";
import { isRegistrationLocked } from "@/utils/registrations";
import {
  buildInvoiceDataFromEntries,
  buildInvoiceTeamEntries,
  calculateInvoiceTotals,
  convertInvoiceTeamsToRegistrationEntries,
} from "@/lib/invoices";
import type { RegisteredMemberDTO } from "@/lib/club-data";
import type { BrandGradient } from "@/lib/gradients";
import type {
  TeamMember,
  TeamData,
} from "@/components/features/clubs/TeamCard";

type UnifiedRegistrationPageProps = {
  registrationId: string;
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

export function UnifiedRegistrationPage({
  registrationId,
}: UnifiedRegistrationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

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

  if (isLoading) {
    return <RegistrationDetailSkeleton />;
  }

  if (error || !data || !registration) {
    return null; // Will redirect
  }

  const clubLabel = "Demo Club Owner's Club";

  // Get event data
  const event = findEventById(registration.eventId);

  // Build invoice data
  // For localStorage registrations, we need to handle differently
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

  // Payment status calculation
  const paymentDeadlineDate = registration.paymentDeadline
    ? new Date(registration.paymentDeadline)
    : undefined;
  let paymentStatus: "Paid" | "Unpaid" | "Overdue" = "Unpaid";
  if (registration.paidAt || registration.status === "paid")
    paymentStatus = "Paid";
  else if (paymentDeadlineDate && paymentDeadlineDate < new Date())
    paymentStatus = "Overdue";

  const fallbackInvoiceTotal = Number(registration.invoiceTotal ?? 0);
  const invoiceTotalNumber =
    Number.isFinite(computedInvoiceTotal) && computedInvoiceTotal > 0
      ? computedInvoiceTotal
      : fallbackInvoiceTotal;
  const invoiceTotalLabel = formatCurrency(invoiceTotalNumber);
  const paymentDeadlineLabel =
    paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
      ? formatFriendlyDate(paymentDeadlineDate)
      : undefined;
  const dueDateMonth =
    paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
      ? paymentDeadlineDate
          .toLocaleString("en-US", { month: "short" })
          .toUpperCase()
      : null;
  const dueDateDay =
    paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
      ? paymentDeadlineDate.getDate()
      : null;
  const paidAtDate = registration.paidAt ? new Date(registration.paidAt) : null;
  const paidAtLabel =
    paidAtDate && !Number.isNaN(paidAtDate.getTime())
      ? formatFriendlyDate(paidAtDate)
      : null;
  const paymentTitle =
    paymentStatus === "Paid"
      ? "Payment received"
      : paymentStatus === "Overdue"
        ? "Payment overdue"
        : "Payment required";

  // Invoice info
  const invoiceNumber = localStorageReg
    ? localStorageReg.invoiceNumber
    : registration.id.replace("r-", "").padStart(6, "0") + "-001";
  const invoiceDate = localStorageReg
    ? localStorageReg.invoiceDate
    : registration.snapshotTakenAt || registration.eventDate;

  // Organizer info
  const organizerName =
    registration.organizer ?? event?.organizer ?? "Event organizer";
  const organizerData = organizers.find((org) => org.name === organizerName);
  const organizerGradientVariant: BrandGradient = localStorageReg
    ? ((localStorageReg.organizerGradient ??
        organizerData?.gradient ??
        "teal") as BrandGradient)
    : ((organizerData?.gradient ?? "teal") as BrandGradient);
  const organizerEvents = listEvents().filter(
    (evt) => evt.organizer === organizerName,
  );
  const organizerEventsCount = organizerEvents.length || 1;
  const organizerFollowers = organizerName
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const organizerFollowersLabel = organizerFollowers
    ? organizerFollowers.toLocaleString()
    : "—";
  const organizerHostingYears = (() => {
    const years = organizerEvents
      .map((evt) => new Date(evt.date).getFullYear())
      .filter((year) => Number.isFinite(year));
    if (!years.length) return 1;
    const earliest = Math.min(...years);
    const currentYear = new Date().getFullYear();
    return Math.max(1, currentYear - earliest);
  })();
  const organizerHostingLabel = `${organizerHostingYears} year${organizerHostingYears === 1 ? "" : "s"}`;

  // Location and event info
  const locationLabel =
    registration.location ?? event?.location ?? "Location to be announced";
  const googleMapsHref =
    locationLabel && locationLabel !== "Location to be announced"
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`
      : null;
  const eventDateLabel = registration.eventDate
    ? formatFriendlyDate(registration.eventDate)
    : "Date pending";
  const eventDateObj = registration.eventDate
    ? new Date(registration.eventDate)
    : null;
  const eventDateWeekday =
    eventDateObj && !Number.isNaN(eventDateObj.getTime())
      ? eventDateObj.toLocaleString("en-US", { weekday: "long" })
      : null;
  const registrationDeadlineLabel = registration.registrationDeadline
    ? formatFriendlyDate(registration.registrationDeadline)
    : null;

  // Lock status
  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    registrationDeadline: registration.registrationDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  });

  // URLs
  const eventPageHref = `/events/${registration.eventId}`;
  const invoiceHref = `/clubs/registrations/${registrationId}/invoice`;

  // Division pricing and team options for edit mode
  const divisionPricing = event?.availableDivisions ?? [];
  const teamOptions = (data.teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    division: team.division ?? undefined,
    size: team.size,
  }));

  // Build roster data for team lookups
  const teamRosters: TeamRosterData[] = demoRosters.map((roster) => ({
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

  // Documents & Resources from event
  const documents = [
    {
      name: "Event information packet",
      description: "Schedule overview, scoring rubric, venue policies",
      href: "#",
    },
    {
      name: "Routine music licensing form",
      description: "Submit proof of music licensing for each team",
      href: "#",
    },
    {
      name: "Insurance waiver",
      description: "Collect signed waivers for athletes and staff",
      href: "#",
    },
  ];

  // Event page tab data
  const eventDescription = event?.description ?? undefined;
  const galleryImages = event ? buildEventGalleryImages(event) : [];

  // Event date/time props
  const eventDateProp = registration.eventDate ?? event?.date ?? undefined;
  const eventStartTime = event?.startTime ?? undefined;
  const eventEndTime = event?.endTime ?? undefined;
  const eventTimezone = event?.timezone ?? undefined;

  // Organizer region
  const organizerRegion = organizerData?.region ?? undefined;

  return (
    <RegistrationDetailContent
      registration={{
        id: registrationId,
        eventName: registration.eventName,
        eventId: registration.eventId,
      }}
      isEditMode={isEditMode}
      divisionPricing={divisionPricing}
      teamOptions={teamOptions}
      teamRosters={teamRosters}
      organizerName={organizerName}
      organizerGradientVariant={organizerGradientVariant}
      organizerFollowersLabel={organizerFollowersLabel}
      organizerEventsCount={organizerEventsCount}
      organizerHostingLabel={organizerHostingLabel}
      locationLabel={locationLabel}
      googleMapsHref={googleMapsHref}
      eventDateLabel={eventDateLabel}
      eventDateWeekday={eventDateWeekday}
      registrationDeadlineLabel={registrationDeadlineLabel}
      isLocked={isLocked}
      allDivisions={allDivisions}
      teamsByDivisionArray={teamsByDivisionArray}
      invoiceLineItems={invoiceLineItems}
      subtotal={subtotal}
      totalTax={totalTax}
      invoiceTotal={invoiceTotalNumber}
      invoiceTotalLabel={invoiceTotalLabel}
      invoiceNumber={invoiceNumber}
      invoiceDate={invoiceDate}
      invoiceHref={invoiceHref}
      eventPageHref={eventPageHref}
      paymentStatus={paymentStatus}
      paymentDeadlineLabel={paymentDeadlineLabel}
      paymentTitle={paymentTitle}
      paidAtLabel={paidAtLabel}
      dueDateMonth={dueDateMonth}
      dueDateDay={dueDateDay}
      documents={documents}
      eventDescription={eventDescription}
      galleryImages={galleryImages}
      eventDate={eventDateProp}
      eventStartTime={eventStartTime}
      eventEndTime={eventEndTime}
      eventTimezone={eventTimezone}
      organizerRegion={organizerRegion}
    />
  );
}
