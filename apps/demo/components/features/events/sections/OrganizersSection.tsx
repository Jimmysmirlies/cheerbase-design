/**
 * OrganizersSection
 *
 * Purpose
 * - Promotes event organizers in a horizontally scrollable rail.
 * - Encourages following and hosting via a clear CTA.
 *
 * Structure
 * - Section wrapper (provides spacing and background)
 * - Header: title, subtitle, and optional CTA link
 * - Content rail: scrollable list of OrganizerCard items
 *
 * Customization
 * - Pass a custom title/subtitle and CTA label/href to fit different surfaces.
 * - Provide any Organizer[] data (mock or real) via props.
 */
import Link from "next/link";
import { OrganizerCard, FadeInSection } from "@/components/ui";
import type { Organizer } from "@/types/events";

type OrganizersSectionProps = {
  organizers: Organizer[];
  id?: string;
  title?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function OrganizersSection({
  organizers,
  id = "organizers",
  title = "Event Organizers",
  subtitle = "Follow organizers to unlock private events once you are registered as a club.",
  ctaHref = "/host/apply",
  ctaLabel = "Become an organizer",
}: OrganizersSectionProps) {
  return (
    <FadeInSection>
      <section className="border-y border-border bg-card/60 py-14" id={id}>
        {/* Header: Title, supporting copy, and CTA */}
        <div className="mx-auto max-w-7xl space-y-6 px-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <Link
              className="text-sm font-semibold text-primary underline-offset-4 hover:text-primary/80 hover:underline"
              href={ctaHref}
            >
              {ctaLabel}
            </Link>
          </header>
          {/* Content: Horizontally scrollable organizer cards */}
          <div className="flex snap-x gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {organizers.map((organizer) => (
              <OrganizerCard
                key={organizer.name}
                accentGradient={organizer.accent}
                name={organizer.name}
                region={organizer.region}
                visibility={organizer.visibility}
              />
            ))}
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}
