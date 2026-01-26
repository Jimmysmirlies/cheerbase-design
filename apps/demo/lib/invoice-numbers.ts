/**
 * Centralized invoice number utilities
 *
 * Invoice Number Format: {ORG}-{YYEE}-C{NNN}-{VV}
 * - ORG: 3-letter organizer code
 * - YY: Year (2 digits)
 * - EE: Event sequence within that year for the organizer (01 = first event)
 * - C: Club prefix
 * - NNN: 3-digit club registration order for that event (001 = first club to register)
 * - VV: 2-digit invoice version (01 = original, 02 = revised)
 *
 * Examples:
 * - SAP-2602-C003-01 (Sapphire Productions, 2nd event of 2026, 3rd club, original)
 * - CEE-2501-C001-01 (Cheer Elite Events, 1st event of 2025, 1st club, original)
 */

/**
 * Mapping of organizer names to 3-letter codes
 */
export const ORGANIZER_CODES: Record<string, string> = {
  "Cheer Elite Events": "CEE",
  "Sapphire Productions": "SAP",
  "East Region Events": "ERE",
  "Spirit Sports Co.": "SSC",
  "Midwest Athletics": "MWA",
  "Southern Spirit": "SOS",
  "West Coast Cheer": "WCC",
};

/**
 * Get the 3-letter organizer code for a given organizer name
 * Falls back to first 3 letters uppercased if not in mapping
 */
export function getOrganizerCode(organizerName: string): string {
  return (
    ORGANIZER_CODES[organizerName] ??
    organizerName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()
  );
}

export type InvoiceNumberConfig = {
  organizerCode: string;
  year: number;
  eventSequence: number;
  clubSequence: number;
  version?: number;
};

/**
 * Format an invoice number from its components
 * Format: ORG-YYEE-CNNN-VV
 */
export function formatInvoiceNumber(config: InvoiceNumberConfig): string {
  const {
    organizerCode,
    year,
    eventSequence,
    clubSequence,
    version = 1,
  } = config;
  const yy = String(year).slice(-2);
  const ee = String(eventSequence).padStart(2, "0");
  const nnn = String(clubSequence).padStart(3, "0");
  const vv = String(version).padStart(2, "0");
  return `${organizerCode}-${yy}${ee}-C${nnn}-${vv}`;
}

/**
 * Generate invoice number from components
 */
export function generateInvoiceNumber(
  organizerName: string,
  year: number,
  eventSequence: number,
  clubSequence: number,
  version = 1,
): string {
  const organizerCode = getOrganizerCode(organizerName);
  return formatInvoiceNumber({
    organizerCode,
    year,
    eventSequence,
    clubSequence,
    version,
  });
}

/**
 * Parse an invoice number into its components
 * Returns null if the format is invalid
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  organizerCode: string;
  year: number;
  eventSequence: number;
  clubSequence: number;
  version: number;
} | null {
  // Match format: ORG-YYEE-CNNN-VV
  const match = invoiceNumber.match(
    /^([A-Z]{3})-(\d{2})(\d{2})-C(\d{3})-(\d{2})$/,
  );
  if (!match) return null;

  const [, organizerCode, yearStr, eventStr, clubStr, versionStr] = match;
  const year = 2000 + parseInt(yearStr!, 10);
  const eventSequence = parseInt(eventStr!, 10);
  const clubSequence = parseInt(clubStr!, 10);
  const version = parseInt(versionStr!, 10);

  return {
    organizerCode: organizerCode!,
    year,
    eventSequence,
    clubSequence,
    version,
  };
}

/**
 * Compare two invoice numbers for sorting
 * Returns negative if a < b, positive if a > b, 0 if equal
 */
export function compareInvoiceNumbers(a: string, b: string): number {
  return a.localeCompare(b);
}

// ============================================================================
// Legacy hash-based invoice number generation (for backwards compatibility)
// Used when explicit invoice numbers are not available
// ============================================================================

/**
 * @deprecated Use explicit invoice numbers from seed data instead
 * Kept for backwards compatibility with localStorage registrations
 */
export function computeHashBasedInvoiceId(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const sixDigit = (hash % 900000) + 100000;
  return String(sixDigit).padStart(6, "0");
}

/**
 * @deprecated Use explicit invoice numbers from seed data instead
 * Kept for backwards compatibility with localStorage registrations
 */
export function formatHashBasedInvoiceNumber(
  registrationId: string,
  eventId: string,
  version = 1,
): string {
  const invoiceId = computeHashBasedInvoiceId(`${registrationId}:${eventId}`);
  return `${invoiceId}-${String(version).padStart(3, "0")}`;
}
