import { PageHeader } from "@/components/layout/PageHeader";

const radii = [
  { label: "XS • 6px", className: "rounded-md" },
  { label: "MD • 12px", className: "rounded-xl" },
  { label: "LG • 18px", className: "rounded-2xl" },
  { label: "Pill • 999px", className: "rounded-full" },
];

const rhythm = [4, 8, 12, 16, 24, 32, 48];

export default function SpacingPage() {
  return (
    <>
      <PageHeader
        title="Spacing & Radii"
        subtitle="A 4px base grid keeps layouts tidy. Radii scale with interaction density—larger for touch-first cards and pill-shaped controls."
        breadcrumbs={[
          { label: "Brand Guidelines", href: "/style-guide" },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Radii section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Border Radii</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {radii.map((radius) => (
                <div key={radius.label} className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
                  <div className={`h-24 border border-dashed border-border/60 bg-muted ${radius.className}`} />
                  <p className="text-sm font-semibold text-foreground">{radius.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing rhythm section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Spacing Rhythm</p>
              <p className="text-sm text-muted-foreground">
                Stick to these increments when stacking components or creating gutters. Cards prefer 24px outer padding, 16px
                internal gaps, and 12px for tightly grouped metadata.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 rounded-2xl border border-border bg-card/60 p-6">
              {rhythm.map((size) => (
                <div key={size} className="flex flex-col items-center gap-3">
                  <div className="flex h-24 items-end justify-center rounded-lg border border-dashed border-border/60 bg-muted px-4">
                    <div className="w-6 rounded-t bg-primary" style={{ height: `${size}px` }} />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{size}px</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
