/**
 * QuickFilterRail
 *
 * Purpose
 * - Lightweight pill-style control set for quick filtering.
 * - Typically sits beneath a hero or section header.
 *
 * Behavior
 * - Renders a list of links; the active item gets emphasized styling.
 */
import Link from "next/link";

export type QuickFilter = {
  label: string;
  href?: string;
  active?: boolean;
};

type QuickFilterRailProps = {
  filters: QuickFilter[];
};

export function QuickFilterRail({ filters }: QuickFilterRailProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    // Horizontal pill controls
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.label}
          className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium transition ${
            filter.active
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
          href={filter.href ?? "#"}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
