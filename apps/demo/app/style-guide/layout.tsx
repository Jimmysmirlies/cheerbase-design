"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);
  const sectionItems = useMemo(() => guideSections, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className="border-border/80 sticky top-0 flex h-screen shrink-0 flex-col justify-between border-r bg-card/80 p-3 text-sm backdrop-blur"
        style={{ width: collapsed ? "76px" : "240px" }}
      >
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="hover:bg-muted focus-visible:ring-ring/60 text-muted-foreground hover:text-foreground inline-flex h-10 w-full items-center justify-between rounded-xl px-3 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={collapsed ? "Expand style guide navigation" : "Collapse style guide navigation"}
          >
            <span className="flex items-center gap-2">
              {collapsed ? <PanelLeftOpenIcon className="h-4 w-4" /> : <PanelLeftCloseIcon className="h-4 w-4" />}
              {!collapsed && <span>Sections</span>}
            </span>
          </button>
          <nav className="grid gap-2">
            {sectionItems.map((section) => {
              const initial = section.label.slice(0, 1).toUpperCase();
              return (
                <Link
                  key={section.href}
                  className="hover:bg-muted focus-visible:ring-ring/60 text-muted-foreground hover:text-foreground group relative flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={section.href}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 text-foreground text-xs font-semibold">
                    {initial}
                  </span>
                  {!collapsed ? <span className="truncate">{section.label}</span> : null}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link
          className="hover:bg-muted focus-visible:ring-ring/60 text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          href="/"
        >
          {!collapsed ? "← Back to marketplace" : "←"}
        </Link>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-10 px-6 py-10 pb-20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Design Toolkit</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ralli Style Guide</h1>
            </div>
            <div className="hidden sm:block">
              <Link
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground"
                href="/"
              >
                ← Back to marketplace
              </Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
