const typography = [
  {
    label: "Display",
    className: "text-5xl md:text-6xl",
    description: "Hero headlines on marketplace and dashboard landing."
  },
  {
    label: "Heading",
    className: "text-3xl md:text-4xl",
    description: "Section titles; use to anchor major modules."
  },
  {
    label: "Subheading",
    className: "text-xl md:text-2xl",
    description: "Card headings and important supporting titles."
  },
  {
    label: "Body",
    className: "text-base",
    description: "Default paragraph copy, input descriptions, empty states."
  },
  {
    label: "Small",
    className: "text-sm",
    description: "Metadata, captions, form labels."
  },
  {
    label: "Caption",
    className: "text-xs",
    description: "Pill labels, helper text, badge copy."
  }
];

export default function TypographyPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Typography</h2>
        <p className="text-sm text-muted-foreground">
          The type scale is built on Inter. Pair these sizes with consistent spacing to keep hierarchy predictable.
        </p>
      </header>
      <div className="space-y-6 rounded-2xl border border-border bg-card/70 p-6">
        {typography.map((type) => (
          <div key={type.label} className="space-y-1 border-l-2 border-dashed border-border/70 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{type.label}</p>
            <p className={`${type.className} font-semibold`}>The quick brown fox jumps over the lazy dog.</p>
            <p className="text-xs text-muted-foreground">{type.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
