import type { Person, Team, TeamRoster } from "@/types/club";
import { demoTeams } from "@/data/clubs/teams";
import { demoRosters } from "@/data/clubs/members";
import { demoRegistrations } from "@/data/clubs/registrations";

export type MemberRole = "coach" | "athlete" | "reservist" | "chaperone";
export type RegisteredTeamSource = "club_team" | "upload";

export type RegisteredMemberDTO = Person & { role: MemberRole; personId?: string | null };

export type RegisteredTeamDTO = {
  id: string;
  clubOwnerId: string;
  sourceType: RegisteredTeamSource;
  sourceTeamId?: string | null;
  name: string;
  division: string;
  size: number;
  coedCount: number;
  members: RegisteredMemberDTO[];
};

export type RegistrationDTO = {
  id: string;
  clubOwnerId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  division: string;
  teamId?: string;
  registeredTeamId?: string;
  registeredTeam?: RegisteredTeamDTO | null;
  athletes?: number;
  invoiceTotal: number;
  paymentDeadline?: string;
  registrationDeadline?: string;
  status?: "pending" | "paid";
  paidAt?: string | null;
  createdAt?: string | null;
};

export type ClubData = {
  teams: Team[];
  rosters: TeamRoster[];
  registeredTeams: RegisteredTeamDTO[];
  registrations: RegistrationDTO[];
};

const DEFAULT_CLUB_OWNER_ID = "club-owner-1";

export async function getClubData(clubOwnerId: string = DEFAULT_CLUB_OWNER_ID): Promise<ClubData> {
  void clubOwnerId; // static demo ignores dynamic club owner

  // Build registered teams from the static rosters/teams
  const registeredTeams: RegisteredTeamDTO[] = demoRosters.map((roster) => {
    const team = demoTeams.find((t) => t.id === roster.teamId);
    const members: RegisteredMemberDTO[] = [
      ...roster.coaches.map((p) => ({ ...p, role: "coach" as MemberRole })),
      ...roster.athletes.map((p) => ({ ...p, role: "athlete" as MemberRole })),
      ...roster.reservists.map((p) => ({ ...p, role: "reservist" as MemberRole })),
      ...roster.chaperones.map((p) => ({ ...p, role: "chaperone" as MemberRole })),
    ];
    return {
      id: `rt-${roster.teamId}`,
      clubOwnerId: DEFAULT_CLUB_OWNER_ID,
      sourceType: "club_team",
      sourceTeamId: roster.teamId,
      name: team?.name ?? roster.teamId,
      division: team?.division ?? "",
      size: members.length,
      coedCount: team?.coedCount ?? 0,
      members,
    };
  });

  const registeredTeamMap = new Map(registeredTeams.map((rt) => [rt.id, rt]));

  const registrations: RegistrationDTO[] = demoRegistrations.map((reg) => {
    const registeredTeamId = `rt-${reg.teamId}`;
    return {
      id: reg.id,
      clubOwnerId: DEFAULT_CLUB_OWNER_ID,
      eventId: reg.eventId,
      eventName: reg.eventName,
      eventDate: new Date(reg.eventDate).toISOString(),
      location: reg.location,
      division: reg.division,
      teamId: reg.teamId,
      registeredTeamId,
      registeredTeam: registeredTeamMap.get(registeredTeamId) ?? null,
      athletes: reg.athletes,
      invoiceTotal: Number(reg.invoiceTotal),
      paymentDeadline: reg.paymentDeadline ? new Date(reg.paymentDeadline).toISOString() : undefined,
      registrationDeadline: reg.registrationDeadline ? new Date(reg.registrationDeadline).toISOString() : undefined,
      status: reg.status ?? "pending",
      paidAt: reg.paidAt ? new Date(reg.paidAt).toISOString() : null,
      createdAt: reg.snapshotTakenAt ? new Date(reg.snapshotTakenAt).toISOString() : undefined,
    };
  });

  return {
    teams: demoTeams,
    rosters: demoRosters,
    registeredTeams,
    registrations,
  };
}
