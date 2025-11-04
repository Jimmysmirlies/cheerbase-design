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
    name: "Secondary",
    token: "var(--secondary)",
    text: "var(--secondary-foreground)",
    usage: "Neutral buttons, sidebar backgrounds, soft panels.",
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
    name: "Popover",
    token: "var(--popover)",
    text: "var(--popover-foreground)",
    usage: "Dropdowns, popovers, hover cards.",
  },
  {
    name: "Success",
    token: "var(--success)",
    text: "var(--success-foreground)",
    usage: "Positive confirmations, status chips, toasts.",
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
];

const glassPalette = [
  {
    name: "Glass Peach",
    token: "oklch(var(--glass-peach))",
    usage: "Primary stop for iridescent surfaces (e.g., cards, navbar).",
  },
  {
    name: "Glass Light Yellow",
    token: "oklch(var(--glass-light-yellow))",
    usage: "Second gradient stop for subtle warmth in glass surfaces.",
  },
  {
    name: "Glass Light Green",
    token: "oklch(var(--glass-light-green))",
    usage: "Third gradient stop to introduce soft green tones.",
  },
  {
    name: "Glass Light Blue",
    token: "oklch(var(--glass-light-blue))",
    usage: "Final gradient stop, cools the glass palette.",
  },
];

export default function ColorsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Color Roles</h2>
        <p className="text-sm text-muted-foreground">
          Core palette mapped to semantic roles. Default to these tokens across surfaces and activate extended brand
          colors only for illustrations or analytics.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((color) => (
          <article
            key={color.name}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="rounded-t-2xl p-4" style={{ backgroundColor: color.token, color: color.text ?? "var(--foreground)" }}>
              <p className="text-sm font-semibold">{color.name}</p>
              <p className="text-xs opacity-80">{color.token.replace("var(", "").replace(")", "")}</p>
            </div>
            <div className="space-y-1 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
              <p>Usage: {color.usage}</p>
              {color.text && <p>Foreground token: {color.text.replace("var(", "").replace(")", "")}</p>}
            </div>
          </article>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Glass Palette</h3>
        <p className="text-sm text-muted-foreground">
          Iridescent stops used to build the glass surfaces across cards, nav, and other frosted UI moments.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {glassPalette.map((color) => (
            <article key={color.name} className="flex flex-col justify-between rounded-2xl border border-border bg-card shadow-sm">
              <div className="rounded-t-2xl p-4" style={{ backgroundColor: color.token }}>
                <p className="text-sm font-semibold text-foreground">{color.name}</p>
                <p className="text-xs text-muted-foreground">
                  {color.token.replace("var(", "").replace(")", "")}
                </p>
              </div>
              <div className="space-y-1 border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
                <p>Usage: {color.usage}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="rounded-3xl border border-border/80 bg-card/80 p-6">
          <p className="text-sm font-semibold text-muted-foreground">Example</p>
          <div
            className="mt-3 rounded-3xl p-6 shadow-sm backdrop-blur-xl"
            style={{
              background:
                'linear-gradient(135deg, oklch(var(--glass-peach) / 0.15) 0%, oklch(var(--glass-light-yellow) / 0.15) 25%, oklch(var(--glass-light-green) / 0.15) 50%, oklch(var(--glass-light-blue) / 0.15) 75%, oklch(var(--glass-peach) / 0.15) 100%)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Glass surface</span>
              <h4 className="text-xl font-semibold text-foreground">Iridescent card example</h4>
              <p className="text-sm text-muted-foreground">
                This demo replicates the card treatment used for event cards and the navbar background.
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
