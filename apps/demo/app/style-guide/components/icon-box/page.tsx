"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { IconBox } from "@/components/ui/IconBox";
import {
  CalendarIcon,
  UsersIcon,
  SettingsIcon,
  BellIcon,
  StarIcon,
  HeartIcon,
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

export default function IconBoxComponentPage() {
  return (
    <>
      <PageHeader
        title="Icon Box"
        subtitle="A styled container for icons with optional gradient theming. Use to display icons with consistent styling that can adapt to brand colors."
        breadcrumbs={[
          { label: "Brand Guidelines", href: "/style-guide" },
          { label: "Components", href: "/style-guide/components" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="space-y-12">
          {/* Size Variants section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Size Variants</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Small, Medium, Large
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="flex items-end gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <IconBox
                        icon={<CalendarIcon />}
                        size="sm"
                        gradient="primary"
                      />
                      <span className="text-xs text-muted-foreground">sm</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <IconBox
                        icon={<CalendarIcon />}
                        size="md"
                        gradient="primary"
                      />
                      <span className="text-xs text-muted-foreground">md</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <IconBox
                        icon={<CalendarIcon />}
                        size="lg"
                        gradient="primary"
                      />
                      <span className="text-xs text-muted-foreground">lg</span>
                    </div>
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
                  <div className="flex flex-wrap gap-4">
                    {gradientKeys.map((gradient) => (
                      <div
                        key={gradient}
                        className="flex flex-col items-center gap-2"
                      >
                        <IconBox icon={<StarIcon />} gradient={gradient} />
                        <span className="text-xs text-muted-foreground">
                          {gradient}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Without Gradient section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">
                Without Gradient (Default)
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Muted styling fallback
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="flex gap-4">
                    <IconBox icon={<SettingsIcon />} size="sm" />
                    <IconBox icon={<BellIcon />} size="md" />
                    <IconBox icon={<HeartIcon />} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Different Icons section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">With Different Icons</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Various icon examples
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="flex gap-4">
                    <IconBox icon={<CalendarIcon />} gradient="blue" />
                    <IconBox icon={<UsersIcon />} gradient="green" />
                    <IconBox icon={<SettingsIcon />} gradient="purple" />
                    <IconBox icon={<BellIcon />} gradient="orange" />
                    <IconBox icon={<StarIcon />} gradient="mustard" />
                    <IconBox icon={<HeartIcon />} gradient="red" />
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
                    <td className="px-4 py-3 font-mono text-xs">icon</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      ReactNode
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      The icon to display (required)
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
                      Brand gradient key for theming. When provided, uses
                      gradient&apos;s primary color for icon and light tint for
                      background.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">size</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {'"sm" | "md" | "lg"'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      &quot;md&quot;
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Size variant (sm: 32px, md: 40px, lg: 48px)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">className</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      string
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Additional CSS classes
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
                <li>
                  Background: 10% opacity of gradient&apos;s primary color (or
                  bg-muted fallback)
                </li>
                <li>
                  Icon color: Primary color from gradient (or
                  text-muted-foreground fallback)
                </li>
                <li>Border radius: rounded-lg (8px)</li>
                <li>Icon sizes auto-scale: sm (16px), md (20px), lg (24px)</li>
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
                <li>
                  Use with gradient prop to match organizer or club brand colors
                </li>
                <li>Omit gradient prop for neutral, non-branded contexts</li>
                <li>
                  Pair with QuickActionCard or similar list items for consistent
                  styling
                </li>
                <li>
                  Icon SVGs should not have their own size classes; IconBox
                  handles sizing
                </li>
                <li>
                  Use the same gradient throughout a section for visual
                  consistency
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
