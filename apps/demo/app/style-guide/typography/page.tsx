"use client";

import { PageHeader } from "@/components/layout/PageHeader";

type TypeToken = {
  label: string;
  className: string;
  description: string;
  css: {
    fontSize: string;
    lineHeight: string;
    fontWeight?: string;
    letterSpacing?: string;
  };
};

const typeTokens: TypeToken[] = [
  {
    label: "Heading 1",
    className: "heading-1",
    description: "Top-level section titles.",
    css: { fontSize: "2.25rem", lineHeight: "1.1", fontWeight: "600" },
  },
  {
    label: "Heading 2",
    className: "heading-2",
    description: "Major module headings.",
    css: { fontSize: "1.875rem", lineHeight: "1.15", fontWeight: "600" },
  },
  {
    label: "Heading 3",
    className: "heading-3",
    description: "Card titles and sub-sections.",
    css: { fontSize: "1.5rem", lineHeight: "1.2", fontWeight: "600" },
  },
  {
    label: "Heading 4",
    className: "heading-4",
    description: "Subheadings within cards and lists.",
    css: { fontSize: "1.25rem", lineHeight: "1.25", fontWeight: "600" },
  },
  {
    label: "Body Large",
    className: "body-large",
    description: "Lead paragraphs and denser card copy.",
    css: { fontSize: "1.125rem", lineHeight: "1.625" },
  },
  {
    label: "Body Text",
    className: "body-text",
    description: "Default paragraphs and UI copy.",
    css: { fontSize: "1rem", lineHeight: "1.625" },
  },
  {
    label: "Body Small",
    className: "body-small",
    description: "Metadata and secondary text.",
    css: { fontSize: "0.875rem", lineHeight: "1.625" },
  },
  {
    label: "Caption",
    className: "text-xs",
    description: "Helper text, pill labels, dense meta.",
    css: { fontSize: "0.75rem", lineHeight: "1rem" },
  },
];

export default function TypographyPage() {
  return (
    <>
      <PageHeader
        title="Typography"
        subtitle="The type scale is built on Inter. Pair these sizes with consistent spacing to keep hierarchy predictable."
        breadcrumbs={[{ label: "Brand Guidelines", href: "/style-guide" }]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Type scale */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Type Scale</p>
            </div>
            <div className="space-y-6 rounded-2xl border border-border bg-card/70 p-6">
              {typeTokens.map((type) => (
                <div
                  key={type.label}
                  className="space-y-2 border-l-2 border-dashed border-border/70 pl-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {type.label}
                  </p>
                  <p className={`${type.className} font-semibold`}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">CSS:</span>{" "}
                    <code>
                      font-size: {type.css.fontSize}; line-height:{" "}
                      {type.css.lineHeight};
                      {type.css.fontWeight
                        ? ` font-weight: ${type.css.fontWeight};`
                        : ""}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
