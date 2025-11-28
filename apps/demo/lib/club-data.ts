import { MemberRole, PaymentStatus, RegisteredTeamSource } from "@prisma/client";

import type { Person, Team, TeamRoster } from "@/types/club";
import { prisma } from "@/lib/prisma";

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
  registeredTeamId: string;
  registeredTeam: RegisteredTeamDTO | null;
  athletes: number;
  invoiceTotal: number;
  paymentDeadline: string;
  status: "pending" | "paid";
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

type PersonShape = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  dob?: string | Date | null;
};

function toPerson(person: PersonShape): Person {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email ?? undefined,
    phone: person.phone ?? undefined,
    dob: person.dob ? new Date(person.dob).toISOString() : undefined,
  };
}

export async function getClubData(clubOwnerId: string = DEFAULT_CLUB_OWNER_ID): Promise<ClubData> {
  const [teams, registeredTeamsRaw, registrationsRaw] = await Promise.all([
    prisma.team.findMany({
      where: { clubOwnerId },
      include: { members: { include: { person: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.registeredTeam.findMany({
      where: { clubOwnerId },
      include: { members: { include: { person: true } } },
    }),
    prisma.registration.findMany({
      where: { clubOwnerId },
      include: { registeredTeam: { include: { members: { include: { person: true } } } } },
      orderBy: { eventDate: "desc" },
    }),
  ]);

  const rosters: TeamRoster[] = teams.map((team) => {
    const roster: TeamRoster = { teamId: team.id, coaches: [], athletes: [], reservists: [], chaperones: [] };

    team.members.forEach((member) => {
      const person = toPerson(member.person);
      if (member.role === MemberRole.coach) roster.coaches.push(person);
      if (member.role === MemberRole.athlete) roster.athletes.push(person);
      if (member.role === MemberRole.reservist) roster.reservists.push(person);
      if (member.role === MemberRole.chaperone) roster.chaperones.push(person);
    });

    return roster;
  });

  const registeredTeams: RegisteredTeamDTO[] = registeredTeamsRaw.map((rt) => ({
    id: rt.id,
    clubOwnerId: rt.clubOwnerId,
    sourceType: rt.sourceType,
    sourceTeamId: rt.sourceTeamId,
    name: rt.name,
    division: rt.division,
    size: rt.size,
    coedCount: rt.coedCount,
    members: rt.members.map((member) => ({
      ...toPerson(member.person ?? member),
      role: member.role,
      personId: member.personId,
    })),
  }));
  const registeredTeamMap = new Map(registeredTeams.map((rt) => [rt.id, rt]));

  const registrations: RegistrationDTO[] = registrationsRaw.map((reg) => ({
    id: reg.id,
    clubOwnerId: reg.clubOwnerId,
    eventId: reg.eventId,
    eventName: reg.eventName,
    eventDate: reg.eventDate.toISOString(),
    location: reg.location,
    division: reg.division,
    registeredTeamId: reg.registeredTeamId,
    registeredTeam: registeredTeamMap.get(reg.registeredTeamId) ?? null,
    athletes: reg.athletes,
    invoiceTotal: reg.invoiceTotal.toNumber(),
    paymentDeadline: reg.paymentDeadline.toISOString(),
    status: reg.status === PaymentStatus.paid ? "paid" : "pending",
    paidAt: reg.paidAt ? reg.paidAt.toISOString() : null,
    createdAt: reg.createdAt.toISOString(),
  }));

  return {
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name,
      division: team.division,
      size: team.size,
      coedCount: team.coedCount,
    })),
    rosters,
    registeredTeams,
    registrations,
  };
}
