"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import {
  CalendarPlusIcon,
  ListIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  BellIcon,
} from "lucide-react";
import type { BrandGradient } from "@/lib/gradients";

const gradientKeys: BrandGradient[] = [
  "primary",
  "teal",
  "blue",
  "mustard",
  "red",
  "orange",
  "green",
  "indigo",
  "purple",
];

export default function QuickActionCardComponentPage() {
  return (
    <>
      <PageHeader
        title="Quick Action Card"
        subtitle="A full-width card for call-to-action navigation items. Features an IconBox, title, description, and arrow indicator for dashboards and quick actions."
        breadcrumbs={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="space-y-12">
          {/* Basic Examples section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Basic Examples</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  With gradient (branded)
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="space-y-3">
                    <QuickActionCard
                      href="#"
                      icon={<CalendarPlusIcon className="size-5" />}
                      title="Create Event"
                      description="Set up a new competition or showcase event"
                      gradient="primary"
                    />
                    <QuickActionCard
                      href="#"
                      icon={<ListIcon className="size-5" />}
                      title="View Events"
                      description="Manage your upcoming and past events"
                      gradient="primary"
                    />
                    <QuickActionCard
                      href="#"
                      icon={<ReceiptIcon className="size-5" />}
                      title="Manage Invoices"
                      description="Review payments and outstanding balances"
                      gradient="primary"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Without gradient (neutral)
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="space-y-3">
                    <QuickActionCard
                      href="#"
                      icon={<SettingsIcon className="size-5" />}
                      title="Settings"
                      description="Configure your account preferences"
                    />
                    <QuickActionCard
                      href="#"
                      icon={<UsersIcon className="size-5" />}
                      title="Team Members"
                      description="Manage team roster and permissions"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient Variants section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Gradient Variants</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  All brand gradients
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="space-y-3">
                    {gradientKeys.map((gradient) => (
                      <QuickActionCard
                        key={gradient}
                        href="#"
                        icon={<BellIcon className="size-5" />}
                        title={`${gradient.charAt(0).toUpperCase() + gradient.slice(1)} Gradient`}
                        description={`Example using the ${gradient} brand gradient`}
                        gradient={gradient}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Grid Layout</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Horizontal layout on larger screens (xl:grid-cols-3)
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="grid gap-3 xl:grid-cols-3">
                    <QuickActionCard
                      href="#"
                      icon={<CalendarPlusIcon className="size-5" />}
                      title="Create Event"
                      description="Set up a new competition"
                      gradient="blue"
                    />
                    <QuickActionCard
                      href="#"
                      icon={<ListIcon className="size-5" />}
                      title="View Events"
                      description="Manage your events"
                      gradient="blue"
                    />
                    <QuickActionCard
                      href="#"
                      icon={<ReceiptIcon className="size-5" />}
                      title="Manage Invoices"
                      description="Review payments"
                      gradient="blue"
                    />
                  </div>
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
                      Default
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">href</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Destination URL (required)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">icon</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      ReactNode
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Icon to display in the IconBox (required)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">title</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Primary title text (required)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">description</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Secondary description text (required)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">gradient</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      BrandGradient
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Brand gradient key for IconBox theming
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
              <ul className="list-inside list-disc space-y-1">
                <li>Border: 1px solid border-border/60</li>
                <li>Border radius: rounded-lg (8px)</li>
                <li>Padding: p-4 (16px)</li>
                <li>Gap between elements: gap-4 (16px)</li>
                <li>Hover: bg-muted/50</li>
                <li>Arrow icon: size-5, text-muted-foreground</li>
              </ul>
            </div>
          </div>

          {/* Usage Guidelines section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Usage Guidelines</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Use for primary navigation actions on dashboards</li>
                <li>
                  Pass gradient prop to match the organizer or club brand colors
                </li>
                <li>
                  Titles should be action-oriented (e.g., &quot;Create
                  Event&quot;, &quot;View Reports&quot;)
                </li>
                <li>
                  Descriptions should briefly explain what the action does
                </li>
                <li>
                  Stack vertically on mobile, use grid layout on larger screens
                </li>
                <li>Group related actions together in the same section</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
