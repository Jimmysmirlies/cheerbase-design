"use client"

import { Suspense, useEffect, useMemo, useState } from "react";

import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/shadcn/select";
import { cn } from "@workspace/ui/lib/utils";

import { EventCard } from "@/components/ui/cards/EventCard";
import { FadeInSection } from "@/components/ui";
import { listEvents } from "@/data/events";
import { divisionCatalog } from "@/data/divisions";
import { useSearchParams } from "next/navigation";

function SearchEventsPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = (searchParams.get("q") ?? "").trim();
  const events = useMemo(() => listEvents(), []);

  // "Filter Rail": organizer filter and division category chips.
  const organizers = useMemo(
    () => Array.from(new Set(events.map((event) => event.organizer))).sort(),
    [events]
  );

  // "Division Chips": tabs for category-level filtering.
  const divisionCategories = useMemo(
    () => ["All", ...divisionCatalog.map((category) => category.name)],
    []
  );

  const [query, setQuery] = useState(initialQuery);
  const [selectedDivisionCategory, setSelectedDivisionCategory] = useState<string>("All");
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>("all");

  // Apply filters
  const filteredEvents = useMemo(() => {
    const term = query.toLowerCase();
    return events.filter((event) => {
      const matchesQuery = term
        ? `${event.name} ${event.organizer} ${event.location}`.toLowerCase().includes(term)
        : true;

      const matchesDivision =
        selectedDivisionCategory === "All" || event.tags?.includes(selectedDivisionCategory);

      const matchesOrganizer = selectedOrganizer === "all" ? true : event.organizer === selectedOrganizer;

      return matchesQuery && matchesDivision && matchesOrganizer;
    });
  }, [events, query, selectedDivisionCategory, selectedOrganizer]);

  // Keep query in sync with URL param changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <main className="bg-background text-foreground">
      {/* "Search Shell": overall search layout container */}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
        {/* "Hero Blurb": heading + helper text */}
        <FadeInSection>
          <header className="space-y-2">
            <h1 className="heading-1 sm:text-4xl">Search Events</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Find events by title, organizer, or location. Refine with division categories and organizer filters.
            </p>
          </header>
        </FadeInSection>

        {/* "Filter Row": division badges + organizer select */}
        <FadeInSection delay={100}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {divisionCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedDivisionCategory === category ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 text-xs font-semibold"
                  onClick={() => setSelectedDivisionCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedOrganizer} onValueChange={setSelectedOrganizer}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by organizer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All organizers</SelectItem>
                  {organizers.map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FadeInSection>

        {/* "Results Grid": count summary + cards */}
        <FadeInSection delay={180}>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {filteredEvents.length} result{filteredEvents.length === 1 ? '' : 's'}
                {query ? ` for "${query}"` : ''}
              </p>
            </div>

            <div className={cn('grid gap-6', 'sm:grid-cols-2', 'lg:grid-cols-4')}>
              {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                image={event.image}
                title={event.name}
                organizer={event.organizer}
                date={event.date}
                  location={event.location}
                  teams={event.teams}
                  href={`/events/${encodeURIComponent(event.id)}`}
                />
              ))}
              {filteredEvents.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
                  No events found. Try adjusting your filters.
                </div>
              ) : null}
            </div>
          </section>
        </FadeInSection>
      </section>
    </main>
  );
}

export default function SearchEventsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading search...</div>}>
      <SearchEventsPageContent />
    </Suspense>
  );
}
