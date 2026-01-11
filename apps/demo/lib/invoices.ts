import type { Event, DivisionPricing } from "@/types/events";
import type {
  ClubData,
  MemberRole,
  RegisteredMemberDTO,
  RegisteredTeamDTO,
  RegisteredTeamSource,
  RegistrationDTO,
} from "@/lib/club-data";
import type { InvoiceData } from "@/components/features/registration/invoice/InvoiceView";
import type {
  RegistrationEntry,
  RegistrationMember,
} from "@/components/features/registration/flow/types";
import { DEFAULT_ROLE } from "@/components/features/registration/flow/types";
import {
  groupEntriesByDivision,
  getEntryMemberCount,
} from "@/utils/registration-stats";
import { resolveDivisionPricing } from "@/utils/pricing";

type BuildInvoiceOptions = {
  clubName?: string;
  invoiceId?: string;
  orderVersion?: number;
};

const DEFAULT_GST_RATE = 0.05;
const DEFAULT_QST_RATE = 0.09975;

export type InvoiceTeamEntry = {
  id: string;
  registrationId: string;
  eventId: string;
  division: string;
  teamName?: string;
  teamId?: string | null;
  registeredTeamId?: string | null;
  members: RegisteredMemberDTO[];
  snapshotTakenAt?: string;
  snapshotSourceTeamId?: string;
  paymentDeadline?: string;
  registrationDeadline?: string;
  paidAt?: string | null;
  sourceType?: RegisteredTeamSource;
};

function computeSixDigitId(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const sixDigit = (hash % 900000) + 100000; // ensures 100000–999999
  return String(sixDigit).padStart(6, "0");
}

function normalizeInvoiceId(rawId?: string, seed?: string) {
  if (rawId) {
    const digits = rawId.replace(/\D/g, "");
    if (digits) return digits.slice(-6).padStart(6, "0");
    return rawId.trim().slice(0, 6).padEnd(6, "0");
  }

  return computeSixDigitId(seed ?? "invoice");
}

function formatInvoiceNumber(invoiceId: string, orderVersion: number) {
  const safeId = invoiceId.trim() || "invoice";
  const version = String(orderVersion).padStart(3, "0");
  return `${safeId}-${version}`;
}

function titleCaseRole(role?: string) {
  if (!role) return DEFAULT_ROLE;
  return role.slice(0, 1).toUpperCase() + role.slice(1);
}

function mapMembersToRegistrationMembers(
  members: RegisteredMemberDTO[] | undefined,
): RegistrationMember[] | undefined {
  if (!members?.length) return undefined;
  return members.map((member) => ({
    name: `${member.firstName} ${member.lastName}`.trim(),
    type: titleCaseRole(member.role),
    email: member.email,
    phone: member.phone,
    dob: member.dob,
  }));
}

function normalizeDivisionName(division: string, event?: Event | null) {
  const trimmed = division.trim();
  const baseName = trimmed || "Division";
  if (!event?.availableDivisions?.length) return baseName;

  const normalized = baseName.toLowerCase();
  const matched = event.availableDivisions.find(
    (option) => option.name.toLowerCase() === normalized,
  );
  return matched?.name ?? baseName;
}

function resolveRegisteredTeam(
  registration: RegistrationDTO,
  clubData: ClubData,
): RegisteredTeamDTO | null {
  return (
    registration.registeredTeam ??
    (registration.registeredTeamId
      ? clubData.registeredTeams.find(
          (rt) => rt.id === registration.registeredTeamId,
        )
      : null) ??
    (registration.teamId
      ? clubData.registeredTeams.find(
          (rt) => rt.sourceTeamId === registration.teamId,
        )
      : null) ??
    null
  );
}

function buildMembersFromRoster(
  roster?: ClubData["rosters"][number] | null,
): RegisteredMemberDTO[] {
  if (!roster) return [];

  const mapPeople = (people: typeof roster.coaches, role: MemberRole) =>
    people.map((person) => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      dob: person.dob,
      role,
    }));

  return [
    ...mapPeople(roster.coaches, "coach"),
    ...mapPeople(roster.athletes, "athlete"),
    ...mapPeople(roster.reservists, "reservist"),
    ...mapPeople(roster.chaperones, "chaperone"),
  ];
}

function buildInvoiceTeamEntryFromRegistration(
  registration: RegistrationDTO,
  clubData: ClubData,
  event?: Event | null,
): InvoiceTeamEntry | null {
  const registeredTeam = resolveRegisteredTeam(registration, clubData);
  const roster = registration.teamId
    ? clubData.rosters.find((r) => r.teamId === registration.teamId)
    : null;
  const teamRecord = registration.teamId
    ? clubData.teams.find((team) => team.id === registration.teamId)
    : undefined;

  const rosterMembers = buildMembersFromRoster(roster);
  let members = registeredTeam?.members?.length
    ? registeredTeam.members
    : rosterMembers;

  if (
    (!members || members.length === 0) &&
    typeof registration.athletes === "number" &&
    registration.athletes > 0
  ) {
    members = Array.from({ length: registration.athletes }, (_, index) => ({
      id: `${registration.id}-member-${index + 1}`,
      firstName: "Athlete",
      lastName: String(index + 1),
      role: "athlete" as MemberRole,
    }));
  }

  const division = normalizeDivisionName(registration.division, event);
  const teamName =
    registeredTeam?.name ?? teamRecord?.name ?? registration.division;

  return {
    id: registration.id,
    registrationId: registration.id,
    eventId: registration.eventId,
    division,
    teamName,
    teamId:
      registration.teamId ?? registeredTeam?.sourceTeamId ?? registeredTeam?.id,
    registeredTeamId:
      registeredTeam?.id ?? registration.registeredTeamId ?? null,
    members: members ?? [],
    snapshotTakenAt: registration.snapshotTakenAt,
    snapshotSourceTeamId: registration.snapshotSourceTeamId,
    paymentDeadline: registration.paymentDeadline,
    registrationDeadline: registration.registrationDeadline,
    paidAt: registration.paidAt ?? null,
    sourceType: registeredTeam?.sourceType,
  };
}

export function buildInvoiceTeamEntries(
  clubData: ClubData,
  eventId: string,
  event?: Event | null,
  options?: { scope?: "event" | "registration"; registrationId?: string },
): InvoiceTeamEntry[] {
  const scope = options?.scope ?? "event";
  const scopedRegistrations = clubData.registrations.filter((reg) => {
    if (reg.eventId !== eventId) return false;
    if (scope === "registration" && options?.registrationId) {
      return reg.id === options.registrationId;
    }
    return true;
  });

  return scopedRegistrations
    .map((reg) => buildInvoiceTeamEntryFromRegistration(reg, clubData, event))
    .filter((entry): entry is InvoiceTeamEntry => Boolean(entry));
}

function deriveIssuedDate(registration: RegistrationDTO) {
  const candidates = [
    registration.snapshotTakenAt,
    registration.paymentDeadline,
    registration.eventDate,
  ];
  const resolved = candidates.find(Boolean);
  return resolved ? new Date(resolved) : new Date();
}

function ensureDivisionPricing(
  basePricing: DivisionPricing[],
  entries: RegistrationEntry[],
  registration: RegistrationDTO,
): DivisionPricing[] {
  const pricingByName = new Map(
    basePricing.map((option) => [option.name, option]),
  );
  const participantsByDivision = entries.reduce<Record<string, number>>(
    (acc, entry) => {
      const currentCount = acc[entry.division] ?? 0;
      acc[entry.division] = currentCount + getEntryMemberCount(entry);
      return acc;
    },
    {},
  );

  const invoiceTotalNumber = Number(registration.invoiceTotal ?? 0);

  const ensuredPricing: DivisionPricing[] = [...basePricing];

  Object.entries(participantsByDivision).forEach(
    ([division, participantCount]) => {
      if (pricingByName.has(division)) return;
      const safeParticipants = participantCount > 0 ? participantCount : 1;
      const derivedUnitPrice =
        invoiceTotalNumber > 0 ? invoiceTotalNumber / safeParticipants : 0;

      ensuredPricing.push({
        name: division,
        regular: {
          price: Number.isFinite(derivedUnitPrice) ? derivedUnitPrice : 0,
        },
      });
    },
  );

  return ensuredPricing;
}

export function convertInvoiceTeamsToRegistrationEntries(
  entries: InvoiceTeamEntry[],
): RegistrationEntry[] {
  return entries.map((entry) => ({
    id: entry.id,
    division: entry.division,
    mode: entry.sourceType === "upload" ? "upload" : "existing",
    teamId: entry.teamId ?? undefined,
    teamName: entry.teamName,
    teamSize: entry.members.length,
    members: mapMembersToRegistrationMembers(entry.members),
    snapshotTakenAt: entry.snapshotTakenAt,
    snapshotSourceTeamId: entry.snapshotSourceTeamId,
    paymentDeadline: entry.paymentDeadline,
    registrationDeadline: entry.registrationDeadline,
    paidAt: entry.paidAt ?? undefined,
  }));
}

export function buildInvoiceDataFromEntries(
  entries: RegistrationEntry[],
  registration: RegistrationDTO,
  event: Event | null,
  _clubData: ClubData,
  options?: BuildInvoiceOptions,
): InvoiceData {
  const orderVersion = options?.orderVersion ?? 1;
  const invoiceId = normalizeInvoiceId(
    options?.invoiceId,
    `${registration.id}:${registration.eventId}`,
  );
  const invoiceNumber = formatInvoiceNumber(invoiceId, orderVersion);

  const entriesByDivision = groupEntriesByDivision(entries);
  const divisionPricing = ensureDivisionPricing(
    event?.availableDivisions ?? [],
    entries,
    registration,
  );

  const issuedDate = deriveIssuedDate(registration);
  const status = registration.status === "paid" ? "paid" : "unpaid";

  const baseInvoice: InvoiceData = {
    invoiceNumber,
    orderVersion,
    issuedDate,
    eventName: registration.eventName,
    clubName: options?.clubName ?? "Your Club",
    entriesByDivision,
    divisionPricing,
    payments: [],
    status,
    gstRate: DEFAULT_GST_RATE,
    qstRate: DEFAULT_QST_RATE,
  };

  const totals = calculateInvoiceTotals(baseInvoice);

  const payments =
    status === "paid"
      ? [
          {
            amount: totals.total,
            method: "Visa",
            lastFour: "4242",
            date: registration.paidAt
              ? new Date(registration.paidAt)
              : issuedDate,
          },
        ]
      : [];

  return {
    ...baseInvoice,
    payments,
  };
}

export function buildInvoiceDataFromRegistration(
  registration: RegistrationDTO,
  clubData: ClubData,
  event?: Event | null,
  options?: BuildInvoiceOptions,
): InvoiceData {
  const invoiceTeams = buildInvoiceTeamEntries(
    clubData,
    registration.eventId,
    event,
    {
      scope: "event",
      registrationId: registration.id,
    },
  );
  const entries = convertInvoiceTeamsToRegistrationEntries(invoiceTeams);
  return buildInvoiceDataFromEntries(
    entries,
    registration,
    event ?? null,
    clubData,
    options,
  );
}

export function calculateInvoiceTotals(invoice: InvoiceData) {
  const pricingByDivision = invoice.divisionPricing.reduce<
    Record<string, DivisionPricing>
  >((acc, option) => {
    acc[option.name] = option;
    return acc;
  }, {});

  const referenceDate = invoice.issuedDate || new Date();

  const lineItems = Object.entries(invoice.entriesByDivision).map(
    ([divisionName, entries]) => {
      const qty = entries.reduce(
        (sum, entry) => sum + getEntryMemberCount(entry),
        0,
      );
      const pricing = pricingByDivision[divisionName];

      if (!pricing) {
        return {
          category: divisionName,
          qty,
          unit: 0,
          lineTotal: 0,
        };
      }

      const activeTier = resolveDivisionPricing(pricing, referenceDate);
      return {
        category: divisionName,
        qty,
        unit: activeTier.price,
        lineTotal: qty * activeTier.price,
      };
    },
  );

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const gstRate = invoice.gstRate ?? DEFAULT_GST_RATE;
  const qstRate = invoice.qstRate ?? DEFAULT_QST_RATE;
  const gstAmount = subtotal * gstRate;
  const qstAmount = subtotal * qstRate;
  const totalTax = gstAmount + qstAmount;
  const total = subtotal + totalTax;

  const totalPaid = (invoice.payments ?? []).reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const balanceDue = total - totalPaid;

  return {
    lineItems,
    subtotal,
    gstAmount,
    qstAmount,
    totalTax,
    total,
    totalPaid,
    balanceDue,
  };
}
