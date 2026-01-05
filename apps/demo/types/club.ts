export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dob?: string; // YYYY-MM-DD
};

export type Team = {
  id: string;
  name: string;
  division: string;
  size: number;
  coedCount: number; // number of male athletes
};

export type Registration = {
  id: string;
  eventId: string;
  eventName: string;
  organizer: string;
  eventDate: string;
  location: string;
  division: string;
  teamId: string;
  athletes: number;
  invoiceTotal: string; // demo currency string
  paymentDeadline: string; // ISO string in demo
  registrationDeadline?: string; // ISO string in demo
  status?: "pending" | "paid";
  paidAt?: string;
  submittedAt?: string; // ISO string - when registration was submitted
  snapshotTakenAt?: string;
  snapshotSourceTeamId?: string;
  snapshotRosterHash?: string;
};

export type MemberRole = "coach" | "athlete" | "reservist" | "chaperone";

export type TeamRoster = {
  teamId: string;
  coaches: Person[];
  athletes: Person[];
  reservists: Person[];
  chaperones: Person[];
  updatedAt?: string;
};
