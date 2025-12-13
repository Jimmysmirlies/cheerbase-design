"use client"

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { GlassSelect } from "@workspace/ui/components/glass-select";
import { cn } from "@workspace/ui/lib/utils";
import { Input } from "@workspace/ui/shadcn/input";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/shadcn/toggle-group";

import { EventCard } from "@/components/ui/cards/EventCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { listOpenEvents, organizers } from "@/data/events";
import { getProvinceFromLocation, getProvinceOptions } from "@/data/events/locations";
import { useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

type LayoutVariant = "A" | "B";

function LayoutToggle({
  variant,
  onChange,
}: {
  variant: LayoutVariant;
  onChange: (variant: LayoutVariant) => void;
}) {
  return (
    <div className="relative inline-flex items-center rounded-md border p-1 transition-all duration-300 border-border/70 bg-muted/40">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(v) => v && onChange(v as LayoutVariant)}
        className="gap-0"
      >
        {(["A", "B"] as const).map((v) => (
          <ToggleGroupItem
            key={v}
            value={v}
            aria-label={`Layout ${v}`}
            className="size-7 rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs font-semibold"
          >
            {v}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function SearchEventsPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = (searchParams.get("q") ?? "").trim();
  const events = useMemo(() => listOpenEvents(), []);
  const provinceOptions = useMemo(() => getProvinceOptions(events), [events]);
  const organizerNames = useMemo(() => organizers.map((org) => org.name), []);

  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("A");
  const [query, setQuery] = useState(initialQuery);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>("all");

  // Keep query in sync with URL param changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const provinceOptionsWithAll = useMemo(
    () => [{ code: "all", label: "All regions" }, ...provinceOptions],
    [provinceOptions],
  );

  const organizerOptionsWithAll = useMemo(
    () => [{ value: "all", label: "All organizers" }, ...organizerNames.map((name) => ({ value: name, label: name }))],
    [organizerNames],
  );

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    const base = [...events].filter((event) => {
      const matchesProvince =
        selectedProvince === "all" ? true : getProvinceFromLocation(event.location)?.code === selectedProvince;
      const matchesOrganizer = selectedOrganizer === "all" ? true : event.organizer === selectedOrganizer;
      const divisionNames = event.availableDivisions?.map((d) => d.name).join(" ") ?? "";
      const matchesTerm =
        term.length === 0 ||
        `${event.name} ${event.organizer} ${event.location} ${divisionNames}`.toLowerCase().includes(term);
      return matchesProvince && matchesOrganizer && matchesTerm;
    });
    const sorted = base.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted;
  }, [events, selectedProvince, selectedOrganizer, query]);

  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
        {/* Layout A: Streamlined results view */}
        {layoutVariant === "A" ? (
          <>
            <motion.header 
              className="flex items-start justify-between gap-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
                <h1 className="heading-1 sm:text-4xl">
                  {query ? `Search Results for: ${query}` : "Search Events"}
                </h1>
                <LayoutToggle variant={layoutVariant} onChange={setLayoutVariant} />
            </motion.header>

            <motion.div 
              className="flex flex-wrap items-center gap-3"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
                <GlassSelect
                  value={selectedProvince}
                  onValueChange={setSelectedProvince}
                  options={provinceOptionsWithAll.map((opt) => ({ value: opt.code, label: opt.label }))}
                  className="w-full sm:w-auto sm:min-w-[180px]"
                />
                <GlassSelect
                  value={selectedOrganizer}
                  onValueChange={setSelectedOrganizer}
                  options={organizerOptionsWithAll}
                  className="w-full sm:w-auto sm:min-w-[180px]"
                />
            </motion.div>
          </>
        ) : (
          /* Layout B: Full search interface */
          <>
            <motion.header 
              className="flex items-start justify-between gap-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
                <div className="space-y-2">
                  <h1 className="heading-1 sm:text-4xl">Search Events</h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Find events by title, organizer, or location. Refine with division categories and organizer filters.
                  </p>
                </div>
                <LayoutToggle variant={layoutVariant} onChange={setLayoutVariant} />
            </motion.header>

            <motion.div 
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
                <div className="relative min-w-0 flex-[1.6]">
                  <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    className="h-10 w-full rounded-md border border-border/50 bg-card pl-10 body-text shadow-sm"
                    placeholder="Search events, divisions, organizers, and locations"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center">
                  <GlassSelect
                    value={selectedProvince}
                    onValueChange={setSelectedProvince}
                    options={provinceOptionsWithAll.map((opt) => ({ value: opt.code, label: opt.label }))}
                    className="w-full lg:flex-1"
                  />
                  <GlassSelect
                    value={selectedOrganizer}
                    onValueChange={setSelectedOrganizer}
                    options={organizerOptionsWithAll}
                    className="w-full lg:flex-1"
                  />
                </div>
            </motion.div>
          </>
        )}

        <motion.section 
          className="space-y-4"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {filteredEvents.length} result{filteredEvents.length === 1 ? "" : "s"}
                {layoutVariant === "B" && query ? ` for "${query}"` : ""}
              </p>
            </div>

          <motion.div 
            className={cn("grid gap-6 items-stretch", "sm:grid-cols-2", "lg:grid-cols-4")}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
              {filteredEvents.map((event, index) => (
              <motion.div key={`${event.id}-${index}`} variants={fadeInUp} className="h-full">
                  <EventCard
                    image={event.image}
                    title={event.name}
                    organizer={event.organizer}
                    date={event.date}
                    location={event.location}
                    teams={event.teams}
                    href={`/events/${encodeURIComponent(event.id)}`}
                  />
              </motion.div>
              ))}
              {filteredEvents.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">
                  No events found. Try adjusting your search or filters.
                </div>
              ) : null}
          </motion.div>
        </motion.section>
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
