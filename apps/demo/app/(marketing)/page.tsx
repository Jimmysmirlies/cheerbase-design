"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { Hero, HorizontalScrollSection, HorizontalScrollCard } from "@/components/ui";
import { EventCardV2, getRegistrationStatus } from "@/components/ui/cards/EventCardV2";
import { fadeInUp } from "@/lib/animations";
import { heroSlides, listEvents } from "@/data/events";
import { getProvinceFromLocation } from "@/data/events/locations";

// Featured organizer (Sapphire Productions)
const FEATURED_ORGANIZER = "Sapphire Productions";

// Default region to show in "Find Events in Your Area"
const DEFAULT_REGION = "QC"; // Quebec

// Order organizers: featured first, then by event count
const ORGANIZER_ORDER = [
  "Sapphire Productions",
  "West Coast Cheer",
  "Spirit Sports Co.",
  "Midwest Athletics",
  "Southern Spirit",
  "East Region Events",
  "Cheer Elite Events",
  "Cheer Squad Prestige Academy",
];

export default function HomePage() {
  const events = useMemo(() => listEvents(), []);

  // Filter events by region (Quebec)
  const regionalEvents = useMemo(() => {
    return events.filter((event) => {
      const province = getProvinceFromLocation(event.location);
      return province?.code === DEFAULT_REGION;
    });
  }, [events]);

  // Group events by organizer
  const eventsByOrganizer = useMemo(() => {
    return events.reduce<Record<string, typeof events>>((acc, event) => {
      const current = acc[event.organizer] ?? [];
      acc[event.organizer] = [...current, event];
      return acc;
    }, {});
  }, [events]);

  // Get organizers with events, in preferred order
  const organizersWithEvents = useMemo(() => {
    const withEvents = ORGANIZER_ORDER.filter(
      (name) => (eventsByOrganizer[name]?.length ?? 0) > 0
    );
    // Add any organizers not in the order list
    Object.keys(eventsByOrganizer).forEach((name) => {
      if (!withEvents.includes(name)) {
        withEvents.push(name);
      }
    });
    return withEvents;
  }, [eventsByOrganizer]);

  return (
    <main className="bg-background text-foreground">
      {/* Hero: Featured experiences carousel with CTA */}
      <Hero slides={heroSlides} />

      {/* Regional events row */}
      {regionalEvents.length > 0 && (
        <motion.section
          className="mx-auto w-full max-w-7xl px-6 py-6"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <HorizontalScrollSection
            title="Find Events in Your Area"
            titleHref="/events/search"
          >
            {regionalEvents.map((event) => (
              <HorizontalScrollCard key={`regional-${event.id}`}>
                <EventCardV2
                  id={event.id}
                  image={event.image}
                  title={event.name}
                  date={event.date}
                  location={event.location}
                  teamsFilled={event.slots.filled}
                  teamsCapacity={event.slots.capacity}
                  statusLabel={getRegistrationStatus(event)}
                  href={`/events/${encodeURIComponent(event.id)}`}
                />
              </HorizontalScrollCard>
            ))}
          </HorizontalScrollSection>
        </motion.section>
      )}

      {/* Organizer rows */}
      {organizersWithEvents.map((organizerName) => {
        const organizerEvents = eventsByOrganizer[organizerName] ?? [];
        const isFeatured = organizerName === FEATURED_ORGANIZER;

        return (
          <motion.section
            key={organizerName}
            className="mx-auto w-full max-w-7xl px-6 py-6"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <HorizontalScrollSection
              title={organizerName}
              featured={isFeatured}
            >
              {organizerEvents.map((event) => (
                <HorizontalScrollCard key={event.id}>
                  <EventCardV2
                    id={event.id}
                    image={event.image}
                    title={event.name}
                    date={event.date}
                    location={event.location}
                    teamsFilled={event.slots.filled}
                    teamsCapacity={event.slots.capacity}
                    statusLabel={getRegistrationStatus(event)}
                    href={`/events/${encodeURIComponent(event.id)}`}
                  />
                </HorizontalScrollCard>
              ))}
            </HorizontalScrollSection>
          </motion.section>
        );
      })}

      {/* Footer: Global links and product tagline */}
      <footer className="border-t border-sidebar-border bg-sidebar">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span
              className="text-lg font-semibold bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, #0D9488 0%, #0891B2 50.22%, #06B6D4 100%)",
              }}
            >
              cheerbase
            </span>
            <p className="text-sm text-muted-foreground">
              The discovery-first platform connecting clubs, organizers, and
              communities.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-medium text-muted-foreground">
            <Link className="hover:text-foreground" href="/events/search">
              Browse Events
            </Link>
            <Link className="hover:text-foreground" href="/register">
              Register Club
            </Link>
            <Link className="hover:text-foreground" href="/host/apply">
              Host Events
            </Link>
            <Link className="hover:text-foreground" href="/terms">
              Terms
            </Link>
            <Link className="hover:text-foreground" href="/privacy">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
