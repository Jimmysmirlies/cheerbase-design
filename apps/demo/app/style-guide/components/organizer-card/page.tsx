import { PageHeader } from "@/components/layout/PageHeader";
import { OrganizerGlassCard } from "@/components/ui";

export default function OrganizerCardComponentPage() {
  return (
    <>
      <PageHeader
        title="Organizer Card"
        subtitle="Compact card for organizer rails and recommendations. Initials auto-generate from organizer name."
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
            <div className="flex flex-wrap gap-4 rounded-3xl border border-border bg-card/60 p-6">
              <OrganizerGlassCard
                accentGradient="from-rose-400 via-rose-500 to-rose-600"
                name="Cheer Elite Events"
                region="National"
                visibility="Public"
              />
              <OrganizerGlassCard
                accentGradient="from-indigo-400 via-indigo-500 to-indigo-600"
                name="Spirit Sports Co."
                region="Southeast"
                visibility="Public"
              />
              <OrganizerGlassCard
                accentGradient="from-emerald-400 via-emerald-500 to-emerald-600"
                name="West Coast Cheer"
                region="Pacific"
                visibility="Public"
              />
              <OrganizerGlassCard
                accentGradient="from-amber-400 via-amber-500 to-amber-600"
                name="Southern Spirit"
                region="Southwest"
                visibility="Private"
              />
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
                    <td className="px-4 py-3 font-mono text-xs">name</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Organizer name (used for initials)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">region</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Geographic region label
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">visibility</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Visibility status (Public/Private)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">
                      accentGradient
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Tailwind gradient classes for avatar
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
                <li>Radius LG for card container</li>
                <li>Small text for metadata</li>
                <li>Muted chip background for badges</li>
                <li>Gradient avatar with initials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
