import { PageHeader } from "@/components/layout/PageHeader";
import { QuickFilterRail } from "@/components/ui";

export default function QuickFilterRailComponentPage() {
  return (
    <>
      <PageHeader
        title="Quick Filter Rail"
        subtitle="Pill-based filter controls for top-of-page filtering or dashboard subsets. Handles active styling internally."
        breadcrumbs={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Examples section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Examples</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Default (first active)
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <QuickFilterRail
                    filters={[
                      { label: "All", href: "#", active: true },
                      { label: "Upcoming", href: "#" },
                      { label: "Past", href: "#" },
                      { label: "Invite-only", href: "#" },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Middle active
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <QuickFilterRail
                    filters={[
                      { label: "All Events", href: "#" },
                      { label: "Championships", href: "#", active: true },
                      { label: "Friendly", href: "#" },
                      { label: "Regionals", href: "#" },
                    ]}
                  />
                </div>
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
                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">filters</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      FilterItem[]
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Array of filter options
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FilterItem Object section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">FilterItem Object</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Property
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">label</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Display text
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">href</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Link destination
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">active</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      boolean?
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Whether this filter is selected
                    </td>
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
                <li>Pill radius for filter items</li>
                <li>Small text sizing</li>
                <li>Border transitions on hover/active</li>
                <li>Primary color for active state</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
