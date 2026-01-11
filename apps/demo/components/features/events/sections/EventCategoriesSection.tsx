"use client";

/**
 * EventCategoriesSection
 *
 * Purpose
 * - Displays curated groups of events (categories), each with a title and description.
 * - Renders a responsive grid of EventCard components under each category.
 *
 * Structure
 * - Section wrapper with top/bottom spacing
 * - For each category:
 *   - Header: category title + subtitle
 *   - Grid: EventCard[] (responsive columns)
 */
import { motion } from "framer-motion";
import { EventCard } from "@/components/ui";
import type { EventCategory } from "@/types/events";
import { fadeInUp, staggerContainer } from "@/lib/animations";

type EventCategoriesSectionProps = {
  categories: EventCategory[];
  id?: string;
  cardSize?: "default" | "compact";
};

export default function EventCategoriesSection({
  categories,
  id = "categories",
  cardSize = "default",
}: EventCategoriesSectionProps) {
  return (
    <section className="bg-background py-16" id={id}>
      <motion.div
        className="mx-auto max-w-7xl space-y-12 px-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {categories.map((category) => (
          <motion.div key={category.title} variants={fadeInUp}>
            <div className="space-y-6">
              {/* Category header: title and supporting subtitle */}
              <header className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {category.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {category.subtitle}
                </p>
              </header>
              {/* Category grid: event cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.events.map((event) => (
                  <EventCard
                    key={event.id}
                    date={event.date}
                    href={`/events/${event.id}`}
                    image={event.image}
                    location={event.location}
                    organizer={event.organizer}
                    teams={event.teams}
                    title={event.name}
                    size={cardSize}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
