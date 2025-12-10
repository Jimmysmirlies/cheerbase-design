import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/ui";
import { getLocalEventImage } from "@/utils/localImages";

export default function EventCardComponentPage() {
  return (
    <>
      <PageHeader
        title="Event Card"
        subtitle="Marketplace-ready card that surfaces event metadata, pricing, and an action button."
        hideSubtitleDivider
        breadcrumbItems={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Variants section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Variants</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Default</p>
                <EventCard
                  date="Nov 14, 2025"
                  href="#"
                  image={getLocalEventImage("style-guide-event-default")}
                  location="Madison Square Garden, NY"
                  organizer="Cheer Elite Events"
                  teams="32 / 48 teams"
                  title="National Cheerleading Championship"
                  size="default"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Compact</p>
                <EventCard
                  date="Jul 19, 2025"
                  href="#"
                  image={getLocalEventImage("style-guide-event-compact")}
                  location="Austin Sports Center, TX"
                  organizer="Southern Spirit"
                  teams="18 / 32 teams"
                  title="Summer Series Classic"
                  size="compact"
                />
              </div>
            </div>
          </div>

          {/* Props section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Props</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Prop</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">image</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Event cover image URL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">title</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Event name</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">organizer</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Organizer name</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">date</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Event date display</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">location</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Venue and city</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">teams</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Team count display (e.g., &quot;32 / 48 teams&quot;)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">fee</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string?</td>
                    <td className="px-4 py-3 text-muted-foreground">Optional registration fee</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">href</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Link destination</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">size</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">&quot;default&quot; | &quot;compact&quot;</td>
                    <td className="px-4 py-3 text-muted-foreground">Card size variant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Design Tokens section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Design Tokens</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-1">
                <li>Radius LG for card container</li>
                <li>Subheading typography for title</li>
                <li>Small metadata text</li>
                <li>Primary CTA button</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
