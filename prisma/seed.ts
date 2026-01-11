/// <reference types="node" />

import {
  PrismaClient,
  MemberRole,
  PaymentStatus,
  RegisteredTeamSource,
} from "@prisma/client";

import { demoTeams } from "../apps/demo/data/clubs/teams.js";
import { demoRosters } from "../apps/demo/data/clubs/members.js";
import { demoRegistrations } from "../apps/demo/data/clubs/registrations.js";
import type { Person } from "../apps/demo/types/club.js";

const prisma = new PrismaClient();
const CLUB_OWNER_ID = "club-owner-1";

type WithRole = {
  role: MemberRole;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    dob?: string;
    email?: string;
    phone?: string;
  };
};

function parseDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseMoney(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

async function main() {
  await prisma.registration.deleteMany();
  await prisma.registeredMember.deleteMany();
  await prisma.registeredTeam.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.person.deleteMany();
  await prisma.team.deleteMany();

  // Seed Teams
  for (const team of demoTeams) {
    await prisma.team.create({
      data: {
        id: team.id,
        clubOwnerId: CLUB_OWNER_ID,
        name: team.name,
        division: team.division,
        size: team.size,
        coedCount: team.coedCount,
      },
    });
  }

  // Seed Persons + TeamMembers (club-managed rosters)
  const personIds = new Set<string>();
  for (const roster of demoRosters) {
    const { teamId } = roster;
    const members: WithRole[] = [
      ...roster.coaches.map((person: Person) => ({
        role: MemberRole.coach,
        person,
      })),
      ...roster.athletes.map((person: Person) => ({
        role: MemberRole.athlete,
        person,
      })),
      ...roster.reservists.map((person: Person) => ({
        role: MemberRole.reservist,
        person,
      })),
      ...roster.chaperones.map((person: Person) => ({
        role: MemberRole.chaperone,
        person,
      })),
    ];

    for (const { person, role } of members) {
      if (!personIds.has(person.id)) {
        await prisma.person.create({
          data: {
            id: person.id,
            clubOwnerId: CLUB_OWNER_ID,
            firstName: person.firstName,
            lastName: person.lastName,
            dob: parseDate(person.dob),
            email: person.email ?? null,
            phone: person.phone ?? null,
          },
        });
        personIds.add(person.id);
      }

      await prisma.teamMember.create({
        data: {
          teamId,
          personId: person.id,
          role,
        },
      });
    }
  }

  // Seed RegisteredTeams + RegisteredMembers + Registrations (snapshots)
  for (const reg of demoRegistrations) {
    const sourceTeam = demoTeams.find((t) => t.id === reg.teamId);
    const sourceRoster = demoRosters.find((r) => r.teamId === reg.teamId);

    const registeredTeam = await prisma.registeredTeam.create({
      data: {
        clubOwnerId: CLUB_OWNER_ID,
        sourceType: RegisteredTeamSource.club_team,
        sourceTeamId: sourceTeam?.id,
        name: sourceTeam?.name ?? reg.teamId,
        division: reg.division,
        size: sourceTeam?.size ?? reg.athletes ?? 0,
        coedCount: sourceTeam?.coedCount ?? 0,
        members: {
          create: (sourceRoster
            ? [
                ...sourceRoster.coaches.map((person: Person) => ({
                  role: MemberRole.coach,
                  person,
                })),
                ...sourceRoster.athletes.map((person: Person) => ({
                  role: MemberRole.athlete,
                  person,
                })),
                ...sourceRoster.reservists.map((person: Person) => ({
                  role: MemberRole.reservist,
                  person,
                })),
                ...sourceRoster.chaperones.map((person: Person) => ({
                  role: MemberRole.chaperone,
                  person,
                })),
              ]
            : []
          ).map(({ role, person }) => ({
            role,
            personId: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            dob: parseDate(person.dob),
            email: person.email ?? null,
            phone: person.phone ?? null,
          })),
        },
      },
    });

    await prisma.registration.create({
      data: {
        id: reg.id,
        clubOwnerId: CLUB_OWNER_ID,
        eventId: reg.eventId,
        eventName: reg.eventName,
        eventDate: parseDate(reg.eventDate) ?? new Date(),
        location: reg.location,
        division: reg.division,
        registeredTeamId: registeredTeam.id,
        athletes: reg.athletes,
        invoiceTotal: parseMoney(reg.invoiceTotal),
        paymentDeadline: parseDate(reg.paymentDeadline) ?? new Date(),
        status:
          reg.status === "paid" ? PaymentStatus.paid : PaymentStatus.pending,
        paidAt: parseDate(reg.paidAt),
        createdAt: parseDate(reg.snapshotTakenAt) ?? new Date(),
      },
    });
  }

  console.log("Seeded teams, rosters, registered teams, and registrations.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
