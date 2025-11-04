import type { EventCategory } from "@/types/events";

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
        date: "Nov 14, 2025",
        location: "Madison Square Garden, NY",
        teams: "32 / 48 teams",
        fee: "$450",
        image: "https://images.unsplash.com/photo-1570378164207-c63f05bc2685?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 3 - Large",
        slots: {
          filled: 32,
          capacity: 48,
          statusLabel: "Few spots left",
        },
        pricePerParticipant: "$125 per athlete",
        description:
          "Three-day championship featuring certified judges, optional skills clinics, and on-site video review lounges for coaches.",
        tags: ["Nationals Qualifier", "Just Added"],
        gallery: [
          "https://images.unsplash.com/photo-1570378164207-c63f05bc2685?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - Open - 4",
            earlyBird: { price: 74, deadline: "2025-08-31" },
            regular: { price: 84 },
          },
          {
            name: "All Star Cheer - Open Coed - 6ST",
            earlyBird: { price: 79, deadline: "2025-09-15" },
            regular: { price: 89 },
          },
          {
            name: "All Star Cheer - U18 - 4",
            earlyBird: { price: 72, deadline: "2025-08-15" },
            regular: { price: 82 },
          },
        ],
      },
      {
        id: "spring-regional",
        name: "Spring Regional Competition",
        organizer: "Spirit Sports Co.",
        type: "Regional",
        date: "Apr 19, 2025",
        location: "Dallas Convention Center, TX",
        teams: "18 / 32 teams",
        fee: "$325",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 4 - Coed",
        slots: {
          filled: 18,
          capacity: 32,
          statusLabel: "Plenty of space",
        },
        pricePerParticipant: "$95 per athlete",
        description:
          "One-day meet with optional travel packages, full warm-up rotations, and feedback sessions from regional judges.",
        tags: ["Travel Friendly"],
        gallery: [
          "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - U16 - 3",
            earlyBird: { price: 85, deadline: "2024-11-30" },
            regular: { price: 95 },
          },
          {
            name: "All Star Cheer - U16 - 4",
            earlyBird: { price: 82, deadline: "2024-12-15" },
            regular: { price: 92 },
          },
          {
            name: "All Star Cheer - U16 - 5ST",
            earlyBird: { price: 88, deadline: "2025-01-15" },
            regular: { price: 94 },
          },
        ],
      },
      {
        id: "atlantic-showdown",
        name: "Atlantic Showdown Invitational",
        organizer: "East Region Events",
        type: "Invitational",
        date: "May 03, 2025",
        location: "Boston Convention Center, MA",
        teams: "12 / 24 teams",
        fee: "$375",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 3 - Small",
        slots: {
          filled: 12,
          capacity: 24,
        },
        pricePerParticipant: "$105 per athlete",
        description:
          "Invitation-only showcase with spotlight performances, curated judges panel, and hospitality lounge for club directors.",
        tags: ["Invite Only"],
        gallery: [
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - U12 - 3",
            earlyBird: { price: 58, deadline: "2025-02-15" },
            regular: { price: 68 },
          },
          {
            name: "All Star Cheer - U12 - 4",
            earlyBird: { price: 62, deadline: "2025-02-28" },
            regular: { price: 72 },
          },
          {
            name: "All Star Cheer - U12 - 4ST",
            earlyBird: { price: 64, deadline: "2025-03-10" },
            regular: { price: 74 },
          },
        ],
      },
      {
        id: "summer-series",
        name: "Summer Series Classic",
        organizer: "Southern Spirit",
        type: "Championship",
        date: "Jul 19, 2025",
        location: "Austin Sports Center, TX",
        teams: "28 / 36 teams",
        fee: "$410",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55ddc?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 4 - Large",
        slots: {
          filled: 28,
          capacity: 36,
          statusLabel: "Summer favorite",
        },
        pricePerParticipant: "$110 per athlete",
        description:
          "Season warm-up featuring outdoor block party, optional choreography labs, and live-streamed finals for families.",
        tags: ["Outdoor Fan Fest"],
        gallery: [
          "https://images.unsplash.com/photo-1543163521-1bf539c55ddc?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - U18 - 2",
            earlyBird: { price: 60, deadline: "2025-04-30" },
            regular: { price: 70 },
          },
          {
            name: "All Star Cheer - U18 - 3",
            earlyBird: { price: 66, deadline: "2025-05-31" },
            regular: { price: 76 },
          },
          {
            name: "All Star Cheer - U18 - 4.2",
            earlyBird: { price: 69, deadline: "2025-06-15" },
            regular: { price: 79 },
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
        date: "Sep 06, 2025",
        location: "Buffalo Convention Center, NY",
        teams: "20 / 40 teams",
        fee: "$390",
        image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 3 - Medium",
        slots: {
          filled: 20,
          capacity: 40,
        },
        pricePerParticipant: "$118 per athlete",
        description:
          "Signature fall opener with panel feedback, specialty stunt divisions, and upgraded production lighting.",
        tags: ["Season Kickoff"],
        gallery: [
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1508675801607-166bcdd5dff4?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - Open - 3",
            earlyBird: { price: 68, deadline: "2025-06-30" },
            regular: { price: 78 },
          },
          {
            name: "All Star Cheer - Open - 4",
            earlyBird: { price: 72, deadline: "2025-07-31" },
            regular: { price: 82 },
          },
          {
            name: "All Star Cheer - Open AG - 6",
            earlyBird: { price: 80, deadline: "2025-08-15" },
            regular: { price: 90 },
          },
        ],
      },
      {
        id: "pacific-prestige",
        name: "Pacific Prestige Invitational",
        organizer: "West Coast Cheer",
        type: "Invitational",
        date: "Oct 11, 2025",
        location: "Los Angeles Convention Center, CA",
        teams: "25 / 30 teams",
        fee: "$460",
        image: "https://images.unsplash.com/photo-1508675801607-166bcdd5dff4?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 4 - Elite",
        slots: {
          filled: 25,
          capacity: 30,
          statusLabel: "Elite showcase",
        },
        pricePerParticipant: "$135 per athlete",
        description:
          "Prestige-branded invitational with curated emcees, cinematic streaming, and judges meet-and-greet.",
        tags: ["Premier Production", "Invite Only"],
        gallery: [
          "https://images.unsplash.com/photo-1508675801607-166bcdd5dff4?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - Open Large Coed (5-16 Males) - 6",
            earlyBird: { price: 82, deadline: "2025-08-31" },
            regular: { price: 92 },
          },
          {
            name: "All Star Cheer - Open Large Coed (5-16 Males) - 7",
            earlyBird: { price: 86, deadline: "2025-09-15" },
            regular: { price: 94 },
          },
          {
            name: "All Star Cheer - U18 - 6",
            earlyBird: { price: 80, deadline: "2025-09-01" },
            regular: { price: 90 },
          },
        ],
      },
      {
        id: "southwest-showdown",
        name: "Southwest Showdown",
        organizer: "Spirit Sports Co.",
        type: "Regional",
        date: "Aug 23, 2025",
        location: "Phoenix Civic Center, AZ",
        teams: "14 / 28 teams",
        fee: "$340",
        image: "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 3 - Coed",
        slots: {
          filled: 14,
          capacity: 28,
        },
        pricePerParticipant: "$99 per athlete",
        description:
          "High-energy regional with climate-controlled warm-ups, vendor village, and on-site routine replay booths.",
        tags: ["Regional Circuit"],
        gallery: [
          "https://images.unsplash.com/photo-1487956382158-bb926046304a?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - U18 Small Coed (1-4 Males) - 5",
            earlyBird: { price: 78, deadline: "2025-05-31" },
            regular: { price: 88 },
          },
          {
            name: "All Star Cheer - U16 - 5",
            earlyBird: { price: 70, deadline: "2025-06-15" },
            regular: { price: 80 },
          },
          {
            name: "All Star Cheer - U16 - 4ST",
            earlyBird: { price: 72, deadline: "2025-06-30" },
            regular: { price: 82 },
          },
        ],
      },
      {
        id: "metro-finals",
        name: "Metro Finals Classic",
        organizer: "Midwest Athletics",
        type: "Championship",
        date: "Oct 25, 2025",
        location: "United Center, IL",
        teams: "30 / 48 teams",
        fee: "$445",
        image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=900&q=80&ixlib=rb-4.0.3",
        division: "Junior Level 4 - Large",
        slots: {
          filled: 30,
          capacity: 48,
          statusLabel: "Trending",
        },
        pricePerParticipant: "$120 per athlete",
        description:
          "Metro-season finals with live scoring displays, certified athletic trainers, and coaches strategy summit.",
        tags: ["Finals Weekend"],
        gallery: [
          "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80&ixlib=rb-4.0.3",
        ],
        availableDivisions: [
          {
            name: "All Star Cheer - U18 - 5ST",
            earlyBird: { price: 84, deadline: "2025-09-10" },
            regular: { price: 94 },
          },
          {
            name: "All Star Cheer - U18 AG - 5",
            earlyBird: { price: 82, deadline: "2025-09-20" },
            regular: { price: 92 },
          },
          {
            name: "All Star Cheer - U18 Coed - 6ST",
            earlyBird: { price: 86, deadline: "2025-09-30" },
            regular: { price: 95 },
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
