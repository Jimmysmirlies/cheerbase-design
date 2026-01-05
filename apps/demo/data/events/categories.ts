import { eventDivisionNames } from "@/data/divisions";
import type { EventCategory } from "@/types/events";
import { getLocalEventImage, getLocalGalleryImages } from "@/utils/localImages";

/**
 * Helper to calculate registration deadline from event date.
 * Returns 7 days before the event date as ISO string.
 */
function getRegistrationDeadline(eventDate: string, daysBeforeEvent = 7): string {
  const date = new Date(eventDate);
  date.setDate(date.getDate() - daysBeforeEvent);
  return date.toISOString().split('T')[0] as string;
}

export const eventCategories: EventCategory[] = [
  {
    title: "Junior Level 3 & 4",
    subtitle: "Events designed for junior competitive divisions.",
    events: [
      {
        id: "national-championship",
        name: "National Cheerleading Championship",
        organizer: "Cheer Elite Events",
        type: "Championship",
        date: "Nov 14, 2026",
        registrationDeadline: getRegistrationDeadline("Nov 14, 2026"),
        earlyBirdDeadline: "2026-10-12",
        location: "Madison Square Garden, NY",
        teams: "32 / 48 teams",
        image: getLocalEventImage("national-championship"),
        slots: {
          filled: 32,
          capacity: 48,
          statusLabel: "Few spots left",
        },
        description:
          "Three-day championship featuring certified judges, optional skills clinics, and on-site video review lounges for coaches.",
        tags: ["Nationals Qualifier", "Just Added"],
        gallery: getLocalGalleryImages("national-championship"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 110, deadline: "2025-10-12" },
            regular: { price: 130 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 40, deadline: "2025-10-12" },
            regular: { price: 40 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 45, deadline: "2025-10-12" },
            regular: { price: 45 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 50, deadline: "2025-10-12" },
            regular: { price: 70 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 60, deadline: "2025-10-12" },
            regular: { price: 80 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-10-12" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "spring-regional",
        name: "Spring Regional Competition",
        organizer: "Spirit Sports Co.",
        type: "Friendly Competition",
        date: "Apr 19, 2026",
        registrationDeadline: getRegistrationDeadline("Apr 19, 2026"),
        earlyBirdDeadline: "2026-02-10",
        location: "Dallas Convention Center, TX",
        teams: "18 / 32 teams",
        image: getLocalEventImage("spring-regional"),
        slots: {
          filled: 18,
          capacity: 32,
          statusLabel: "Plenty of space",
        },
        description:
          "One-day meet with optional travel packages, full warm-up rotations, and feedback sessions from regional judges.",
        tags: ["Travel Friendly"],
        gallery: getLocalGalleryImages("spring-regional"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 105, deadline: "2025-02-10" },
            regular: { price: 125 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 38, deadline: "2025-02-10" },
            regular: { price: 38 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 44, deadline: "2025-02-10" },
            regular: { price: 44 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 48, deadline: "2025-02-10" },
            regular: { price: 68 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 58, deadline: "2025-02-10" },
            regular: { price: 78 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-02-10" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "atlantic-showdown",
        name: "Atlantic Showdown Invitational",
        organizer: "East Region Events",
        type: "Friendly Competition",
        date: "May 03, 2026",
        registrationDeadline: getRegistrationDeadline("May 03, 2026"),
        earlyBirdDeadline: "2026-03-01",
        location: "Boston Convention Center, MA",
        teams: "12 / 24 teams",
        image: getLocalEventImage("atlantic-showdown"),
        slots: {
          filled: 12,
          capacity: 24,
        },
        description:
          "Invitation-only showcase with spotlight performances, curated judges panel, and hospitality lounge for club directors.",
        tags: ["Invite Only"],
        gallery: getLocalGalleryImages("atlantic-showdown"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 112, deadline: "2025-03-01" },
            regular: { price: 132 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 42, deadline: "2025-03-01" },
            regular: { price: 42 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 46, deadline: "2025-03-01" },
            regular: { price: 46 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 52, deadline: "2025-03-01" },
            regular: { price: 72 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 62, deadline: "2025-03-01" },
            regular: { price: 82 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-03-01" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "summer-series",
        name: "Summer Series Classic",
        organizer: "Southern Spirit",
        type: "Championship",
        date: "Jul 19, 2026",
        registrationDeadline: getRegistrationDeadline("Jul 19, 2026"),
        earlyBirdDeadline: "2026-06-01",
        location: "Austin Sports Center, TX",
        teams: "28 / 36 teams",
        image: getLocalEventImage("summer-series"),
        slots: {
          filled: 28,
          capacity: 36,
          statusLabel: "Summer favorite",
        },
        description:
          "Season warm-up featuring outdoor block party, optional choreography labs, and live-streamed finals for families.",
        tags: ["Outdoor Fan Fest"],
        gallery: getLocalGalleryImages("summer-series"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 108, deadline: "2025-06-01" },
            regular: { price: 128 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 39, deadline: "2025-06-01" },
            regular: { price: 39 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 43, deadline: "2025-06-01" },
            regular: { price: 43 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 50, deadline: "2025-06-01" },
            regular: { price: 68 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 60, deadline: "2025-06-01" },
            regular: { price: 80 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-06-01" },
            regular: { price: 0 },
          },
        ],
      },
    ],
  },
  {
    title: "Northeast & Southwest",
    subtitle: "Regional competitions focused on travel teams.",
    events: [
      {
        id: "northeast-open",
        name: "Northeast Open",
        organizer: "Cheer Squad Prestige Academy",
        type: "Championship",
        date: "Sep 06, 2026",
        registrationDeadline: getRegistrationDeadline("Sep 06, 2026"),
        earlyBirdDeadline: "2026-07-15",
        location: "Buffalo Convention Center, NY",
        teams: "20 / 40 teams",
        image: getLocalEventImage("northeast-open"),
        slots: {
          filled: 20,
          capacity: 40,
        },
        description:
          "Signature fall opener with panel feedback, specialty stunt divisions, and upgraded production lighting.",
        tags: ["Season Kickoff"],
        gallery: getLocalGalleryImages("northeast-open"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 109, deadline: "2025-07-15" },
            regular: { price: 129 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 40, deadline: "2025-07-15" },
            regular: { price: 40 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 45, deadline: "2025-07-15" },
            regular: { price: 45 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 52, deadline: "2025-07-15" },
            regular: { price: 72 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 62, deadline: "2025-07-15" },
            regular: { price: 82 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-07-15" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "pacific-prestige",
        name: "Pacific Prestige Invitational",
        organizer: "West Coast Cheer",
        type: "Friendly Competition",
        date: "Oct 11, 2026",
        registrationDeadline: getRegistrationDeadline("Oct 11, 2026"),
        earlyBirdDeadline: "2026-09-05",
        location: "Los Angeles Convention Center, CA",
        teams: "25 / 30 teams",
        image: getLocalEventImage("pacific-prestige"),
        slots: {
          filled: 25,
          capacity: 30,
          statusLabel: "Elite showcase",
        },
        description:
          "Prestige-branded invitational with curated emcees, cinematic streaming, and judges meet-and-greet.",
        tags: ["Premier Production", "Invite Only"],
        gallery: getLocalGalleryImages("pacific-prestige"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 115, deadline: "2025-09-05" },
            regular: { price: 135 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 42, deadline: "2025-09-05" },
            regular: { price: 42 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 48, deadline: "2025-09-05" },
            regular: { price: 48 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 55, deadline: "2025-09-05" },
            regular: { price: 75 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 65, deadline: "2025-09-05" },
            regular: { price: 85 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-09-05" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "southwest-showdown",
        name: "Southwest Showdown",
        organizer: "Spirit Sports Co.",
        type: "Friendly Competition",
        date: "Aug 23, 2026",
        registrationDeadline: getRegistrationDeadline("Aug 23, 2026"),
        earlyBirdDeadline: "2026-05-15",
        location: "Phoenix Civic Center, AZ",
        teams: "14 / 28 teams",
        image: getLocalEventImage("southwest-showdown"),
        slots: {
          filled: 14,
          capacity: 28,
        },
        description:
          "High-energy regional with climate-controlled warm-ups, vendor village, and on-site routine replay booths.",
        tags: ["Regional Circuit"],
        gallery: getLocalGalleryImages("southwest-showdown"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 104, deadline: "2025-05-15" },
            regular: { price: 124 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 36, deadline: "2025-05-15" },
            regular: { price: 36 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 42, deadline: "2025-05-15" },
            regular: { price: 42 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 48, deadline: "2025-05-15" },
            regular: { price: 68 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 58, deadline: "2025-05-15" },
            regular: { price: 78 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-05-15" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "metro-finals",
        name: "Metro Finals Classic",
        organizer: "Midwest Athletics",
        type: "Championship",
        date: "Oct 25, 2026",
        registrationDeadline: getRegistrationDeadline("Oct 25, 2026"),
        earlyBirdDeadline: "2026-09-10",
        location: "United Center, IL",
        teams: "30 / 48 teams",
        image: getLocalEventImage("metro-finals"),
        slots: {
          filled: 30,
          capacity: 48,
          statusLabel: "Trending",
        },
        description:
          "Metro-season finals with live scoring displays, certified athletic trainers, and coaches strategy summit.",
        tags: ["Finals Weekend"],
        gallery: getLocalGalleryImages("metro-finals"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 111, deadline: "2025-09-10" },
            regular: { price: 131 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 41, deadline: "2025-09-10" },
            regular: { price: 41 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 47, deadline: "2025-09-10" },
            regular: { price: 47 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 53, deadline: "2025-09-10" },
            regular: { price: 73 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 63, deadline: "2025-09-10" },
            regular: { price: 83 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-09-10" },
            regular: { price: 0 },
          },
        ],
      },
    ],
  },
  {
    title: "Quebec Showcase Series",
    subtitle: "Premier Quebec competitions produced by Sapphire Productions.",
    events: [
      {
        id: "adrenaline-quebec",
        name: "Adrenaline Championship",
        organizer: "Sapphire Productions",
        type: "Championship",
        date: "Nov 29, 2026",
        registrationDeadline: getRegistrationDeadline("Nov 29, 2026"),
        earlyBirdDeadline: "2026-09-30",
        location: "Palais des congrès de Montréal, Montreal, QC, Canada",
        teams: "30 / 50 teams",
        image: getLocalEventImage("adrenaline-quebec"),
        slots: {
          filled: 30,
          capacity: 50,
          statusLabel: "Montreal spotlight",
        },
        description:
          "Season opener with bilingual emcees, live-streamed judges panels, and a coaches-only strategy lounge.",
        tags: ["Quebec Circuit"],
        gallery: getLocalGalleryImages("adrenaline-quebec"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 110, deadline: "2025-09-30" },
            regular: { price: 130 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 42, deadline: "2025-09-30" },
            regular: { price: 44 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 48, deadline: "2025-09-30" },
            regular: { price: 58 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 52, deadline: "2025-09-30" },
            regular: { price: 70 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 63, deadline: "2025-09-30" },
            regular: { price: 83 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-09-30" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "frostfest-montreal",
        name: "Frostfest Championship",
        organizer: "Sapphire Productions",
        type: "Friendly Competition",
        date: "Jan 17, 2026",
        registrationDeadline: getRegistrationDeadline("Jan 17, 2026"),
        earlyBirdDeadline: "2025-11-30",
        location: "Centre Pierre-Charbonneau, Montreal, QC, Canada",
        teams: "22 / 40 teams",
        image: getLocalEventImage("frostfest-montreal"),
        slots: {
          filled: 22,
          capacity: 40,
        },
        description:
          "Winter festival event featuring ice-sculpture village, hot chocolate lounge, and judges feedback pods.",
        tags: ["Winter Series"],
        gallery: getLocalGalleryImages("frostfest-montreal"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 115, deadline: "2025-11-30" },
            regular: { price: 135 },
          },
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 40, deadline: "2025-11-30" },
            regular: { price: 42 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 48, deadline: "2025-11-30" },
            regular: { price: 58 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 50, deadline: "2025-11-30" },
            regular: { price: 68 },
          },
          {
            name: eventDivisionNames.allStarScholastic,
            earlyBird: { price: 60, deadline: "2025-11-30" },
            regular: { price: 80 },
          },
          {
            name: eventDivisionNames.adaptive,
            earlyBird: { price: 0, deadline: "2025-11-30" },
            regular: { price: 0 },
          },
        ],
      },
      {
        id: "cheerfest-quebec",
        name: "Cheerfest Montreal",
        organizer: "Sapphire Productions",
        type: "Championship",
        date: "Feb 06, 2026",
        registrationDeadline: getRegistrationDeadline("Feb 06, 2026"),
        earlyBirdDeadline: "2025-12-01",
        location: "Palais des congrès de Montréal, Montreal, QC, Canada",
        teams: "34 / 50 teams",
        image: getLocalEventImage("cheerfest-quebec"),
        slots: {
          filled: 34,
          capacity: 50,
          statusLabel: "Returning favorite",
        },
        description:
          "High-energy stage with synchronized lighting cues, bilingual announcers, and premium hospitality for club directors.",
        tags: ["Signature Event"],
        gallery: getLocalGalleryImages("cheerfest-quebec"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 120, deadline: "2025-12-01" },
            regular: { price: 140 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 55, deadline: "2025-12-01" },
            regular: { price: 72 },
          },
        ],
      },
      {
        id: "cheerup-quebec",
        name: "CheerUp Invitational",
        organizer: "Sapphire Productions",
        type: "Friendly Competition",
        date: "Feb 28, 2026",
        registrationDeadline: getRegistrationDeadline("Feb 28, 2026"),
        earlyBirdDeadline: "2026-01-15",
        location: "École secondaire Casavant, Saint-Hyacinthe, QC, Canada",
        teams: "18 / 32 teams",
        image: getLocalEventImage("cheerup-quebec"),
        slots: {
          filled: 18,
          capacity: 32,
        },
        description:
          "Community-focused invitational with on-site clinics, emerging team spotlights, and local vendor market.",
        tags: ["Community"],
        gallery: getLocalGalleryImages("cheerup-quebec"),
        availableDivisions: [
          {
            name: eventDivisionNames.chaperone,
            earlyBird: { price: 36, deadline: "2026-01-15" },
            regular: { price: 40 },
          },
          {
            name: eventDivisionNames.prepNovice,
            earlyBird: { price: 45, deadline: "2026-01-15" },
            regular: { price: 60 },
          },
        ],
      },
      {
        id: "groovefest-quebec",
        name: "GrooveFest Dance & Cheer",
        organizer: "Sapphire Productions",
        type: "Friendly Competition",
        date: "Mar 28, 2026",
        registrationDeadline: getRegistrationDeadline("Mar 28, 2026"),
        earlyBirdDeadline: "2026-02-15",
        location: "Théâtre Marcellin-Champagnat, Laval, QC, Canada",
        teams: "24 / 36 teams",
        image: getLocalEventImage("groovefest-quebec"),
        slots: {
          filled: 24,
          capacity: 36,
        },
        description:
          "Hybrid dance and cheer showdown with custom stage backdrops, live DJ sets, and panel chats for coaches.",
        tags: ["Dance & Cheer"],
        gallery: getLocalGalleryImages("groovefest-quebec"),
        availableDivisions: [
          {
            name: eventDivisionNames.worlds,
            earlyBird: { price: 118, deadline: "2026-02-15" },
            regular: { price: 138 },
          },
          {
            name: eventDivisionNames.stuntIndyDuo,
            earlyBird: { price: 50, deadline: "2026-02-15" },
            regular: { price: 60 },
          },
        ],
      },
    ],
  },
];

const eventById = new Map(
  eventCategories.flatMap((category) => category.events.map((event) => [event.id, event] as const)),
);

export function findEventById(id: string) {
  return eventById.get(id);
}

export function listEvents() {
  return Array.from(eventById.values());
}

/**
 * Check if registration is closed for an event.
 * Registration is closed if the deadline has passed or the event date has passed.
 */
export function isRegistrationClosed(event: { registrationDeadline?: string; date: string }): boolean {
  const now = new Date();
  
  // If there's a registration deadline, check against that
  if (event.registrationDeadline) {
    const deadline = new Date(event.registrationDeadline);
    // Set to end of day for the deadline
    deadline.setHours(23, 59, 59, 999);
    if (now > deadline) return true;
  }
  
  // Also check if event date has passed
  const eventDate = new Date(event.date);
  eventDate.setHours(23, 59, 59, 999);
  return now > eventDate;
}

/**
 * List only events with open registration.
 */
export function listOpenEvents() {
  return listEvents().filter(event => !isRegistrationClosed(event));
}
