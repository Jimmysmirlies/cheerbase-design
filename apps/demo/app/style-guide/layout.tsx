import Link from "next/link";
import type { ReactNode } from "react";

const guideSections = [
  { href: "/style-guide", label: "Overview" },
  { href: "/style-guide/colors", label: "Color Roles" },
  { href: "/style-guide/typography", label: "Typography" },
  { href: "/style-guide/spacing", label: "Spacing & Radii" },
  { href: "/style-guide/buttons", label: "Button Patterns" },
  { href: "/style-guide/components", label: "Component Library" },
  { href: "/style-guide/api-contracts", label: "API Contracts" },
];

export default function StyleGuideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Design Toolkit</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ralli Style Guide</h1>
          </div>
          <Link
            className="hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground sm:inline-flex"
            href="/"
          >
            ← Back to marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
        <aside className="sticky top-32 h-fit w-56 space-y-4 rounded-2xl border border-border bg-card/60 p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</p>
          <nav className="grid gap-2">
            {guideSections.map((section) => (
              <Link
                key={section.href}
                className="rounded-lg px-3 py-2 font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                href={section.href}
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 space-y-12 pb-20">{children}</main>
      </div>
    </div>
  );
}
