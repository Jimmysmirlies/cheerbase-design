import { PageHeader } from "@/components/layout/PageHeader";
import { RegistrationNoticeBar } from "@/components/features/events/RegistrationNoticeBar";
import { type BrandGradient } from "@/lib/gradients";

export default function RegistrationNoticeBarPage() {
  const gradients: BrandGradient[] = [
    'primary',
    'teal',
    'blue',
    'mustard',
    'red',
    'orange',
    'green',
    'indigo',
    'purple',
  ];

  return (
    <>
      <PageHeader
        title="Registration Notice Bar"
        subtitle="Displays the current registration phase status with gradient branding for event organizers."
        hideSubtitleDivider
        breadcrumbItems={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Status Variants section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Status Variants</p>
            </div>
            <div className="grid gap-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Early Bird Pricing</p>
                <RegistrationNoticeBar
                  title="Early Bird Pricing"
                  subtitle="Ends Jan 14, 2026"
                  gradient="primary"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Early Bird Ends Soon</p>
                <RegistrationNoticeBar
                  title="Early Bird Pricing Ends Soon"
                  subtitle="Closes Jan 14, 2026"
                  gradient="mustard"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Early Bird Ended</p>
                <RegistrationNoticeBar
                  title="Early Bird Pricing"
                  subtitle="Ended Jan 14, 2026"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration Open</p>
                <RegistrationNoticeBar
                  title="Registration Open"
                  subtitle="Closes in 48 days 22 hrs 52 mins"
                  gradient="teal"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration Closes Soon</p>
                <RegistrationNoticeBar
                  title="Registration Closes Soon"
                  subtitle="Closes in 6 days 14 hrs 23 mins"
                  gradient="orange"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration Closes</p>
                <RegistrationNoticeBar
                  title="Registration Closes"
                  subtitle="Feb 20, 2026"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration Closed</p>
                <RegistrationNoticeBar
                  title="Registration Closed"
                  subtitle="Feb 20, 2026"
                />
              </div>
            </div>
          </div>

          {/* Gradient Variants section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Gradient Variants</p>
              <p className="text-sm text-muted-foreground">
                Each organizer can use their brand gradient to style the notice bar.
              </p>
            </div>
            <div className="grid gap-4">
              {gradients.map((gradient) => (
                <div key={gradient} className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground capitalize">{gradient}</p>
                  <RegistrationNoticeBar
                    title="Registration Open"
                    subtitle="Closes in 48 days 22 hrs 52 mins"
                    gradient={gradient}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Props section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Props</p>
            </div>
            <div className="overflow-hidden rounded-md border border-border/70">
              <table className="w-full table-auto text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-medium sm:px-4">Prop</th>
                    <th className="px-3 py-3 font-medium sm:px-4">Type</th>
                    <th className="px-3 py-3 font-medium sm:px-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">title</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">string</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Phase title (e.g., &quot;Registration Open&quot;)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">subtitle</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">string</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Phase subtitle (e.g., date or countdown)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">gradient</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">BrandGradient?</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Brand gradient variant (primary, teal, blue, etc.)</td>
                  </tr>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">gradientCss</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">string?</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Manual gradient CSS override</td>
                  </tr>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">borderColor</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">string?</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Manual border color override</td>
                  </tr>
                  <tr className="border-t">
                    <td className="text-foreground px-3 py-3 font-mono text-xs sm:px-4">dotColor</td>
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground sm:px-4">string?</td>
                    <td className="px-3 py-3 text-muted-foreground sm:px-4">Manual dot indicator color override</td>
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
            <ul className="list-disc list-inside space-y-1 body-text text-foreground">
              <li>Radius MD for notice bar container</li>
              <li>Body text typography for title and subtitle</li>
              <li>Organizer brand gradient at 6% opacity for background</li>
              <li>Gradient first color at 50% opacity for border</li>
              <li>2.5px colored dot indicator</li>
              <li>Bullet separator (•) between title and subtitle</li>
            </ul>
          </div>

          {/* Usage section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Usage</p>
            </div>
            <div className="body-text text-foreground">
              <p className="mb-2">The Registration Notice Bar is used to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Display current registration phase at the top of event detail pages</li>
                <li>Show active phase with organizer&apos;s brand gradient highlighting</li>
                <li>Provide quick visibility into registration deadlines and countdowns</li>
                <li>Visually separate from detailed timeline cards below</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
