import { PageHeader } from "@/components/layout/PageHeader";
import { ColorSwatch } from "@workspace/ui/components/color-swatch";

const colors = [
  {
    name: "Background",
    token: "var(--background)",
    text: "var(--foreground)",
    usage: "Page canvas, light neutral backdrops for dashboards.",
  },
  {
    name: "Card",
    token: "var(--card)",
    text: "var(--card-foreground)",
    usage: "Cards, modals, and elevated surfaces on the neutral background.",
  },
  {
    name: "Primary",
    token: "var(--primary)",
    text: "var(--primary-foreground)",
    usage: "Main CTAs, active states, emphasis text links.",
  },
  {
    name: "Primary Foreground",
    token: "var(--primary-foreground)",
    usage: "Text/icons placed on primary surfaces.",
  },
  {
    name: "Secondary",
    token: "var(--secondary)",
    text: "var(--secondary-foreground)",
    usage: "Neutral buttons, sidebar backgrounds, soft panels.",
  },
  {
    name: "Secondary Foreground",
    token: "var(--secondary-foreground)",
    usage: "Text/icons placed on secondary surfaces.",
  },
  {
    name: "Muted",
    token: "var(--muted)",
    text: "var(--muted-foreground)",
    usage: "Table header rows, inputs, subtle dividers.",
  },
  {
    name: "Accent",
    token: "var(--accent)",
    text: "var(--accent-foreground)",
    usage: "Marketing flourishes, highlight tags, badges.",
  },
  {
    name: "Accent Lighter",
    token: "var(--accent-lighter)",
    text: "var(--accent-lighter-foreground)",
    usage:
      "Hover states and light highlights (e.g., dropdown items, soft chips).",
  },
  {
    name: "Accent Lighter Foreground",
    token: "var(--accent-lighter-foreground)",
    text: "var(--background)",
    usage:
      "Text/icons on accent-lighter backgrounds when extra contrast is needed.",
  },
  {
    name: "Popover",
    token: "var(--popover)",
    text: "var(--popover-foreground)",
    usage: "Dropdowns, popovers, hover cards.",
  },
  {
    name: "Destructive",
    token: "var(--destructive)",
    text: "var(--destructive-foreground)",
    usage: "Critical warnings, delete flows, destructive buttons.",
  },
  {
    name: "Border",
    token: "var(--border)",
    usage: "Dividers, panel outlines, input borders.",
  },
  {
    name: "Input Base",
    token: "var(--input)",
    usage: "Form inputs, table rows, neutral field backgrounds.",
  },
  {
    name: "Focus Ring",
    token: "var(--ring)",
    usage: "Focus outlines and interactive indicators.",
  },
  {
    name: "Chart 1",
    token: "var(--chart-1)",
    usage: "Primary data series color.",
  },
  {
    name: "Chart 2",
    token: "var(--chart-2)",
    usage: "Secondary data series color.",
  },
  {
    name: "Chart 3",
    token: "var(--chart-3)",
    usage: "Tertiary data visualization accents.",
  },
  {
    name: "Chart 4",
    token: "var(--chart-4)",
    usage: "Supplemental analytics states.",
  },
  {
    name: "Chart 5",
    token: "var(--chart-5)",
    usage: "Extended data palette for dashboards.",
  },
  {
    name: "Sidebar",
    token: "var(--sidebar)",
    text: "var(--sidebar-foreground)",
    usage: "App chrome backgrounds and navigation rails.",
  },
  {
    name: "Sidebar Primary",
    token: "var(--sidebar-primary)",
    text: "var(--sidebar-primary-foreground)",
    usage: "Active nav item background within sidebar.",
  },
  {
    name: "Sidebar Accent",
    token: "var(--sidebar-accent)",
    text: "var(--sidebar-accent-foreground)",
    usage: "Hover states and soft highlights inside sidebars.",
  },
  {
    name: "Sidebar Border",
    token: "var(--sidebar-border)",
    usage: "Separators between navigation and main content.",
  },
  {
    name: "Sidebar Ring",
    token: "var(--sidebar-ring)",
    usage: "Focus outlines within sidebar surfaces.",
  },
];

export default function ColorsPage() {
  return (
    <>
      <PageHeader
        title="Color Roles"
        subtitle="Core palette mapped to semantic roles. Default to these tokens across surfaces and activate extended brand colors only for illustrations or analytics."
        breadcrumbs={[{ label: "Brand Guidelines", href: "/style-guide" }]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Color swatches */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Semantic Tokens</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {colors.map((color) => (
                <ColorSwatch
                  key={color.name}
                  name={color.name}
                  token={color.token}
                  textToken={color.text}
                  usage={color.usage}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
