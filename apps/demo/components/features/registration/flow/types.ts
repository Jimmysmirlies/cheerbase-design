export type TeamOption = {
  id: string;
  name: string;
  division?: string;
  size?: number;
};

export type RegistrationMember = {
  name: string;
  type: string;
  dob?: string;
  email?: string;
  phone?: string;
};

export type RegistrationEntry = {
  id: string;
  division: string;
  mode: "existing" | "upload";
  teamId?: string;
  teamName?: string;
  teamSize?: number;
  fileName?: string;
  members?: RegistrationMember[];
  snapshotTakenAt?: string;
  snapshotSourceTeamId?: string;
  snapshotRosterHash?: string;
  paymentDeadline?: string;
  registrationDeadline?: string;
  paidAt?: string;
  locked?: boolean;
  lockReason?: "paid" | "deadline";
  lockMessage?: string;
  contactEmail?: string;
};

export const DEFAULT_ROLE = "Athlete";
export const ROLE_OPTIONS = [
  DEFAULT_ROLE,
  "Coach",
  "Reservist",
  "Chaperone",
] as const;

// Registration flow UI status used by TeamRow and queue rendering
export type EntryStatusMeta = {
  isLocked: boolean;
  lockReason?: "paid" | "deadline";
  lockMessage?: string;
};
