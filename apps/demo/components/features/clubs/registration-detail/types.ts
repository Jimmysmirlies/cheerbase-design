import type { BrandGradient } from "@/lib/gradients";
import type {
  TeamData,
  TeamMember,
} from "@/components/features/clubs/TeamCard";

export type LayoutVariant = "A" | "B" | "C";

export type RegistrationTabId = "event-page" | "registered-teams";

export type PricingRow = {
  divisionName: string;
  pricePerAthlete: number;
  athleteCount: number;
  total: number;
};

// Registration-specific team data (TeamData with required detailId)
export type RegisteredTeamData = TeamData & { detailId: string };

export type InvoiceLineItem = {
  category: string;
  unit: number;
  qty: number;
  lineTotal: number;
};

export type DivisionPricingProp = {
  name: string;
  earlyBird?: {
    price: number;
    deadline?: string;
  };
  regular: {
    price: number;
  };
};

export type TeamOption = {
  id: string;
  name: string;
  division?: string;
  size?: number;
};

export type DocumentResource = {
  name: string;
  description: string;
  href: string;
};

export type TeamRosterData = {
  teamId: string;
  members: TeamMember[];
};

export type EditModeLineItem = InvoiceLineItem & {
  id: string;
  isNew: boolean;
  isRemoved: boolean;
  isModified: boolean;
  originalQty?: number;
};

export type EditModeInvoice = {
  items: EditModeLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  hasChanges: boolean;
};

// Track individual member additions/removals from rosters
export type MemberChange = {
  id: string;
  type: "member-added" | "member-removed";
  memberName: string;
  teamName: string;
  teamDivision: string;
  previousCount: number;
  newCount: number;
};

export type RegistrationDetailContentProps = {
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
  // Event page tab props
  eventDescription?: string;
  galleryImages?: string[];
  pricingRows?: PricingRow[];
  // Event date/time props
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  eventTimezone?: string;
  // Organizer display props
  organizerRegion?: string;
};

export const LAYOUT_TUTORIAL_STORAGE_KEY = "layout-toggle-tutorial-seen";
export const LAYOUT_TUTORIAL_ITEMS = [
  { label: "A", description: "Two-column with sidebar" },
  { label: "B", description: "Single column with action banner" },
  { label: "C", description: "Single column with quick actions" },
];
