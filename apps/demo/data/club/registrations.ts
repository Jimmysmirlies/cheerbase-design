import type { Registration } from "@/types/club";

export const demoRegistrations: Registration[] = [
  {
    id: "r-1",
    eventId: "national-championship",
    eventName: "National Cheerleading Championship",
    eventDate: "Nov 14, 2025",
    location: "Madison Square Garden, NY",
    division: "All Star Cheer - Open - 4",
    teamId: "t-open-ignite",
    athletes: 18,
    invoiceTotal: "$450",
    paymentDeadline: "2025-10-01",
    status: "pending",
  },
  {
    id: "r-2",
    eventId: "spring-regional",
    eventName: "Spring Regional Competition",
    eventDate: "Apr 19, 2025",
    location: "Dallas Convention Center, TX",
    division: "All Star Cheer - U16 - 3",
    teamId: "t-u16-phoenix",
    athletes: 18,
    invoiceTotal: "$325",
    paymentDeadline: "2025-02-28",
    status: "pending",
  },
];
