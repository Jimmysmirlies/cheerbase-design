import { PageHeader } from "@/components/layout/PageHeader";

export default function StyleGuideOverview() {
  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Use this style guide as the source of truth for Cheerbase's design system tokens and reusable components. Each section dives deeper into colors, typography, spacing, interactions, and shared UI patterns that power the public marketplace, club portal, and organizer hub."
        breadcrumbs={[{ label: "Brand Guidelines", href: "/style-guide" }]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Quick start section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Quick Start</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
                <p className="text-lg font-semibold">What&apos;s inside</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Browse individual sections from the sidebar to understand
                  semantic tokens, layout scales, button variants, and component
                  APIs. Each page mirrors the tokens used in code so designers
                  and engineers stay aligned.
                </p>
              </article>
              <article className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
                <p className="text-lg font-semibold">Keeping it current</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Update this guide whenever new tokens or components ship.
                  Treat it like a live playground—every snippet should be usable
                  in Storybook, Figma, and production.
                </p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
