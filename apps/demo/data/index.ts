/**
 * Data Layer
 *
 * Centralized barrel exports for all mock data.
 * Import from "@/data" instead of individual files.
 */

// Divisions
export {
  divisionCatalog,
  divisionIndex,
  divisionFullNames,
  divisionPricingDefaults,
  eventDivisionNames,
  type DivisionCategory,
  type DivisionTier,
} from "./divisions";

// Registration divisions (pre-computed categories for UI)
export {
  divisionCategories,
  allDivisions,
  type RegistrationDivisionCategory,
} from "./registration/divisions";

// Events
export {
  listEvents,
  getEventsByOrganizerId,
  getActiveEventCount,
  parseEventDate,
  isEventInSeason,
  findOrganizerById,
  isRegistrationClosed,
} from "./events/selectors";

export { eventCategories } from "./events/categories";
export { organizers } from "./events/organizers";
export { heroSlides } from "./events/hero-slides";
export { featuredEvents } from "./events/featured";

// Clubs
export { demoTeams } from "./clubs/teams";
export { demoRegistrations } from "./clubs/registrations";
export { demoRosters } from "./clubs/members";
// Re-export club types from types folder
export type { Team, TeamRoster } from "@/types/club";

// Analytics
export {
  getOrganizerOverview,
  getPaymentHealth,
  getRegistrationTrend,
  getEventPerformance,
  getOrganizerAnalytics,
  getRegistrationTableData,
  formatCurrency,
  formatPercentage,
  type OrganizerOverview,
  type PaymentHealth,
  type MonthlyData,
  type EventPerformance,
  type OrganizerAnalytics,
  type RegistrationStatus,
  type RegistrationTableRow,
} from "./events/analytics";
