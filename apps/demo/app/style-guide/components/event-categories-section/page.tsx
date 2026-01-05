import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import EventCategoriesSection from "@/components/features/events/sections/EventCategoriesSection";
import { eventCategories } from "@/data/events";

export default function EventCategoriesSectionComponentPage() {
  return (
    <>
      <PageHeader
        title="Event Categories"
        subtitle="Grid-based section that lists categories and renders event cards per category."
        breadcrumbs={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Example section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Example</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-border">
              <EventCategoriesSection categories={eventCategories.slice(0, 1)} />
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
                    <td className="px-4 py-3 font-mono text-xs">categories</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">EventCategory[]</td>
                    <td className="px-4 py-3 text-muted-foreground">Array of category objects with events</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">id</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string?</td>
                    <td className="px-4 py-3 text-muted-foreground">Optional section anchor ID</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Object section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Category Object</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Property</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">title</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Category heading</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">subtitle</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 text-muted-foreground">Category description</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">events</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">Event[]</td>
                    <td className="px-4 py-3 text-muted-foreground">Events in this category</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Composition section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Composition</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <p>This section composes the following components:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>
                  <Link href="/style-guide/components/event-card" className="text-primary hover:underline">
                    EventCard
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
