export default function StyleGuideOverview() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Use this style guide as the source of truth for Ralli’s design system tokens and reusable components. Each
          section dives deeper into colors, typography, spacing, interactions, and shared UI patterns that power the
          public marketplace, club portal, and organizer hub.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">What’s inside</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse individual sections from the sidebar to understand semantic tokens, layout scales, button variants,
            and component APIs. Each page mirrors the tokens used in code so designers and engineers stay aligned.
          </p>
        </article>
        <article className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Keeping it current</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Update this guide whenever new tokens or components ship. Treat it like a live playground—every snippet
            should be usable in Storybook, Figma, and production.
          </p>
        </article>
      </div>
    </section>
  );
}
