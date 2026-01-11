import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  BoxIcon,
  LayoutGridIcon,
  UsersIcon,
  CalendarIcon,
  FilterIcon,
  ListIcon,
  PlusSquareIcon,
} from "lucide-react";

const components = [
  {
    name: "Hero",
    description:
      "Split hero layout pairing long-form messaging with a feature visual. Supports carousel slides.",
    href: "/style-guide/components/hero",
    icon: <BoxIcon className="size-5" />,
  },
  {
    name: "Event Card",
    description:
      "Marketplace-ready card that surfaces event metadata, pricing, and an action button.",
    href: "/style-guide/components/event-card",
    icon: <CalendarIcon className="size-5" />,
  },
  {
    name: "Organizer Card",
    description:
      "Compact card for organizer rails and recommendations. Initials auto-generate from name.",
    href: "/style-guide/components/organizer-card",
    icon: <UsersIcon className="size-5" />,
  },
  {
    name: "Quick Filter Rail",
    description:
      "Pill-based filter controls for top-of-page filtering or dashboard subsets.",
    href: "/style-guide/components/quick-filter-rail",
    icon: <FilterIcon className="size-5" />,
  },
  {
    name: "Organizers Section",
    description:
      "Reusable section that renders a horizontal organizer rail with CTA and copy.",
    href: "/style-guide/components/organizers-section",
    icon: <LayoutGridIcon className="size-5" />,
  },
  {
    name: "Event Categories Section",
    description:
      "Grid-based section that lists categories and renders event cards per category.",
    href: "/style-guide/components/event-categories-section",
    icon: <ListIcon className="size-5" />,
  },
  {
    name: "Empty State Button",
    description:
      "Dashed-border button for empty states that prompts users to add content.",
    href: "/style-guide/components/empty-state-button",
    icon: <PlusSquareIcon className="size-5" />,
  },
];

export default function ComponentsPage() {
  return (
    <>
      <PageHeader
        title="Component Library"
        subtitle="Reusable building blocks shared across Cheerbase surfaces. Select a component below to view examples, props, and token usage."
        breadcrumbs={[{ label: "Brand Guidelines", href: "/style-guide" }]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Components grid */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Components</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {components.map((component) => (
                <Link
                  key={component.name}
                  href={component.href}
                  className="group rounded-2xl border border-border bg-card/60 p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      {component.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold group-hover:text-primary transition-colors">
                        {component.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {component.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-4 px-1">
            <div className="h-px w-full bg-border" />
            <div className="rounded-2xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
              Looking for implementation details? Browse the component source in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">
                apps/demo/components/ui
              </code>{" "}
              or port them to the shared UI package when ready.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
