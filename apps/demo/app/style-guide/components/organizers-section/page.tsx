import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import OrganizersSection from "@/components/features/events/sections/OrganizersSection";
import { organizers } from "@/data/events";

export default function OrganizersSectionComponentPage() {
  return (
    <>
      <PageHeader
        title="Organizers Section"
        subtitle="Reusable section that renders a horizontal organizer rail with CTA and copy."
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
              <OrganizersSection organizers={organizers} />
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
                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">organizers</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      Organizer[]
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Array of organizer objects
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">id</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Optional section anchor ID
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">title</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Section heading
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">subtitle</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Section subheading
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">ctaHref</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      CTA button link
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">ctaLabel</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      CTA button text
                    </td>
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
                  <Link
                    href="/style-guide/components/organizer-card"
                    className="text-primary hover:underline"
                  >
                    OrganizerCard
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
