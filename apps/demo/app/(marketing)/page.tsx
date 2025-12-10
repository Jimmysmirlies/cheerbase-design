"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { FadeInSection, Hero } from "@/components/ui";
import { EventCard } from "@/components/ui/cards/EventCard";
import { WalkthroughSpotlight } from "@/components/ui/RegistrationWalkthrough";
import { heroSlides, organizers, listEvents } from "@/data/events";
import { getProvinceFromLocation, getProvinceOptions } from "@/data/events/locations";
import { TextSelect } from "@workspace/ui/components/text-select";

export default function HomePage() {
  const events = useMemo(() => listEvents(), []);
  const eventsByOrganizer = useMemo(() => {
    return events.reduce<Record<string, typeof events>>((acc, event) => {
      const current = acc[event.organizer] ?? [];
      acc[event.organizer] = [...current, event];
      return acc;
    }, {});
  }, [events]);

  const organizerNames = useMemo(() => organizers.map((org) => org.name), []);

  const provinceOptions = useMemo(() => getProvinceOptions(events), [events]);
  const defaultProvince = useMemo(
    () => provinceOptions.find((option) => option.label.toLowerCase().includes("quebec")) ?? provinceOptions[0],
    [provinceOptions],
  );
  const [selectedProvince, setSelectedProvince] = useState<string>(defaultProvince?.code ?? "");
  useEffect(() => {
    if (defaultProvince) {
      setSelectedProvince(defaultProvince.code);
    }
  }, [defaultProvince]);
  const provinceEvents = useMemo(() => {
    if (!selectedProvince) return events.slice(0, 6);
    const filtered = events.filter(
      (event) => getProvinceFromLocation(event.location)?.code === selectedProvince,
    );
    return filtered.length ? filtered : events.slice(0, 6);
  }, [events, selectedProvince]);

  const defaultOrganizer = useMemo(() => organizerNames.find((name) => name.toLowerCase().includes('sapphire')) ?? '', [organizerNames]);
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>(defaultOrganizer || organizerNames[0] || '');
  useEffect(() => {
    if (defaultOrganizer) {
      setSelectedOrganizer(defaultOrganizer);
    } else if (organizerNames[0]) {
      setSelectedOrganizer(organizerNames[0]);
    }
  }, [defaultOrganizer, organizerNames]);
  const organizerEvents = eventsByOrganizer[selectedOrganizer] ?? [];

  const provinceSelectOptions = useMemo(
    () => provinceOptions.map(option => ({ value: option.code, label: option.label })),
    [provinceOptions],
  );
  const organizerSelectOptions = useMemo(
    () => organizers.map(org => ({ value: org.name, label: org.name })),
    [],
  );

  return (
    <main className="bg-background text-foreground">
      {/* Hero: Featured experiences carousel with CTA */}
      <Hero slides={heroSlides} />

            {/* Location-first browsing */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8">
        <FadeInSection>
          <header className="flex flex-wrap items-center gap-3">
            <p className="heading-3">Find events in your area:</p>
            <TextSelect
              value={selectedProvince}
              onValueChange={setSelectedProvince}
              options={provinceSelectOptions}
              size="large"
            />
          </header>
        </FadeInSection>

        <FadeInSection key={`province-${selectedProvince || "all"}`} delay={120}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {provinceEvents.map((event, index) => (
              <FadeInSection key={`${event.id}-${event.location}`} delay={index * 80} className="h-full">
                {index === 0 ? (
                  <WalkthroughSpotlight step="select-event" side="bottom" align="start" advanceOnClick>
                    <EventCard
                      image={event.image}
                      title={event.name}
                      organizer={event.organizer}
                      date={event.date}
                      location={event.location}
                      teams={event.teams}
                      href={`/events/${encodeURIComponent(event.id)}`}
                    />
                  </WalkthroughSpotlight>
                ) : (
                  <EventCard
                    image={event.image}
                    title={event.name}
                    organizer={event.organizer}
                    date={event.date}
                    location={event.location}
                    teams={event.teams}
                    href={`/events/${encodeURIComponent(event.id)}`}
                  />
                )}
              </FadeInSection>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Organizer-first browsing: select an organizer, see their events */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8">
        <FadeInSection>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <header className="flex flex-wrap items-center gap-3">
              <p className="heading-3">Browse events by organizer:</p>
              <TextSelect
                value={selectedOrganizer}
                onValueChange={setSelectedOrganizer}
                options={organizerSelectOptions}
                size="large"
              />
            </header>
            <Link className="text-primary text-sm font-semibold hover:underline sm:self-end" href="/events/search">
              Search all events
            </Link>
          </div>
        </FadeInSection>

        <FadeInSection delay={160}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {organizerEvents.map((event, index) => (
              <FadeInSection key={`${event.id}-organizer`} delay={index * 80} className="h-full">
                <EventCard
                  image={event.image}
                  title={event.name}
                  organizer={event.organizer}
                  date={event.date}
                  location={event.location}
                  teams={event.teams}
                  href={`/events/${encodeURIComponent(event.id)}`}
                />
              </FadeInSection>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* Footer: Global links and product tagline */}
      <footer className="border-t border-border bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Ralli</p>
            <p className="text-sm text-muted-foreground">
              The discovery-first platform connecting clubs, organizers, and communities.
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
