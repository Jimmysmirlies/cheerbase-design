import type { ReactNode } from "react";
import { Button } from "@workspace/ui/shadcn/button";
import { PlusIcon, ExternalLinkIcon } from "lucide-react";

type ButtonExample = {
  label: string;
  usage: string;
  render: ReactNode;
};

const buttonExamples: ButtonExample[] = [
  {
    label: "Primary",
    usage: "Highest emphasis actions such as Save, Continue, Register.",
    render: <Button>Save Changes</Button>,
  },
  {
    label: "Secondary",
    usage: "Pairs with primary CTA or highlights neutral choices.",
    render: <Button variant="secondary">Preview</Button>,
  },
  {
    label: "Outline",
    usage: "Use when the action should blend with the surface while staying available.",
    render: <Button variant="outline">View Details</Button>,
  },
  {
    label: "Ghost",
    usage: "Inline actions, filter resets, or contextual links.",
    render: <Button variant="ghost">Reset Filters</Button>,
  },
  {
    label: "Ghost (Success)",
    usage: "Positive inline actions such as inviting a coach or re-sending confirmations.",
    render: <Button variant="ghost-success">Invite Coach</Button>,
  },
  {
    label: "Link",
    usage: "Text-only link sitting with surrounding copy.",
    render: (
      <Button variant="link" className="px-0">
        View pricing guide
      </Button>
    ),
  },
  {
    label: "Destructive",
    usage: "Irreversible actions like deleting or removing records.",
    render: <Button variant="destructive">Delete Team</Button>,
  },
  {
    label: "Soft Destructive",
    usage: "Gentle warning tone for less critical removals inside modals.",
    render: (
      <Button className="bg-red-100 text-red-600 hover:bg-red-100/80">Remove Member</Button>
    ),
  },
  {
    label: "Accent",
    usage: "Promotional or brand moment actions using the coral accent color.",
    render: (
      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Promote Event</Button>
    ),
  },
  {
    label: "Icon Button",
    usage: "Compact control with iconography (use size=icon).",
    render: (
      <Button size="icon" variant="secondary" aria-label="Add" className="rounded-full">
        <PlusIcon className="h-4 w-4" />
      </Button>
    ),
  },
  {
    label: "Text + Icon",
    usage: "Use inline icons to communicate destination or outcome.",
    render: (
      <Button variant="secondary">
        Open Docs
        <ExternalLinkIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
];

export default function ButtonsPage() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Button Variations</h2>
        <p className="text-sm text-muted-foreground">
          These examples map to shadcn button variants. Pair the purple primary with secondary, ghost, and accent styles
          to build consistent call-to-action hierarchies.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {buttonExamples.map((button) => (
          <article
            key={button.label}
            className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-card/70 p-5 shadow-sm"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {button.label}
              </span>
              <p className="text-xs text-muted-foreground">{button.usage}</p>
            </div>
            <div className="flex flex-wrap gap-2">{button.render}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
