import { PageHeader } from "@/components/layout/PageHeader";
import { Hero, HeroSlide } from "@/components/ui";
import { getLocalEventImage } from "@/utils/localImages";

const heroExampleSlides: HeroSlide[] = [
  {
    id: "style-guide-hero-1",
    eyebrow: "Campaign spotlight",
    headline: "Hero component with split layout and carousel controls.",
    description:
      "Use slides to highlight product moments or experience tiers. Content stays consistent across sizes.",
    highlights: [
      "Left column for messaging, bullets, and CTAs",
      "Right column for imagery or media",
      "Dots and arrows stay anchored below the hero",
    ],
    image: getLocalEventImage("style-guide-hero-1"),
    primaryAction: { label: "Primary CTA", href: "#" },
    secondaryActions: [{ label: "Secondary", href: "#", variant: "secondary" }],
  },
  {
    id: "style-guide-hero-2",
    eyebrow: "Alternate slide",
    headline: "Swap imagery or messaging per slide without layout shifts.",
    description:
      "Slides animate with transforms so each card feels tactile as it enters view.",
    highlights: [
      "Masked edges hint at additional slides",
      "Spacing scales from mobile to desktop",
      "Supports single or multiple actions",
    ],
    image: getLocalEventImage("style-guide-hero-2"),
    primaryAction: { label: "Learn more", href: "#" },
  },
];

export default function HeroComponentPage() {
  return (
    <>
      <PageHeader
        title="Hero"
        subtitle="Split hero layout pairing long-form messaging with a feature visual. Supports carousel slides out of the box."
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
              <Hero slides={heroExampleSlides} />
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
                    <td className="px-4 py-3 font-mono text-xs">slides</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      HeroSlide[]
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Array of slide objects
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Slide Object section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Slide Object</p>
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
                    <td className="px-4 py-3 font-mono text-xs">id</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Unique identifier
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">eyebrow</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Small text above headline
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">headline</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Main heading text
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">description</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Supporting copy
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">highlights</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string[]
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Bullet points
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">image</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Image URL
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">
                      primaryAction
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      Action
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Primary CTA button
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">
                      secondaryActions
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      Action[]
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Optional secondary buttons
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
                <li>Display typography for headlines</li>
                <li>Primary / Secondary button variants</li>
                <li>Pill radius for navigation dots</li>
                <li>Responsive spacing scales</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
