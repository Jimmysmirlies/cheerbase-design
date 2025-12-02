import type { CSSProperties, ReactNode } from "react";

type ClubPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  hideSubtitle?: boolean;
  hideTitle?: boolean;
  breadcrumbs?: ReactNode;
  metadataItems?: { label: string; value: ReactNode }[];
  metadataColumns?: number;
};

const gradientStyle: CSSProperties = {
  backgroundColor: "hsla(0,0%,100%,1)",
  backgroundImage: [
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.5' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")",
    "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)",
  ].join(","),
  backgroundRepeat: "repeat, no-repeat",
  backgroundSize: "auto, auto",
  backgroundBlendMode: "soft-light, normal",
};

export function ClubPageHeader({
  title,
  subtitle,
  action,
  hideSubtitle,
  hideTitle,
  breadcrumbs,
  metadataItems,
  metadataColumns = 3,
}: ClubPageHeaderProps) {
  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/70 backdrop-blur-sm"
      style={gradientStyle}
    >
      <header className="w-full max-w-full px-6 pb-8 pt-18 lg:mx-auto lg:max-w-6xl">
        <div className="flex min-h-[200px] flex-col justify-end gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              {breadcrumbs ? (
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground/80">
                  {breadcrumbs}
                </div>
              ) : null}
              {!hideTitle ? <h1 className="heading-2 text-primary-foreground">{title}</h1> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
          {subtitle && !hideSubtitle ? (
            <p className="text-base text-primary-foreground/85">{subtitle}</p>
          ) : null}
          {(subtitle && !hideSubtitle) || metadataItems?.length ? <div className="h-px w-full bg-primary-foreground/30" /> : null}
          {metadataItems?.length ? (
            <div
              className={`grid gap-8 text-sm text-primary-foreground sm:grid-cols-${metadataColumns}`}
            >
              {metadataItems.map((item, idx) => (
                <div key={`${item.label}-${idx}`} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-primary-foreground/80">{item.label}</span>
                    <span className="font-semibold text-right">{item.value}</span>
                  </div>
                  <div className="h-px w-full bg-primary-foreground/30" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
}
