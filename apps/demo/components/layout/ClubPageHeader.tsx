import type { CSSProperties, ReactNode } from "react";

type ClubPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  hideSubtitle?: boolean;
  hideTitle?: boolean;
  breadcrumbs?: ReactNode;
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

export function ClubPageHeader({ title, subtitle, action, hideSubtitle, hideTitle, breadcrumbs }: ClubPageHeaderProps) {
  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/70 backdrop-blur-sm"
      style={gradientStyle}
    >
        <header className="w-full max-w-full px-6 pt-16 pb-6 lg:mx-auto lg:max-w-7xl">
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              {!hideTitle ? <h1 className="heading-2 text-primary-foreground">{title}</h1> : null}
              {subtitle && !hideSubtitle ? (
                <p className="text-base text-primary-foreground/85">{subtitle}</p>
              ) : null}
              {breadcrumbs ? (
                <div className="text-sm font-medium text-primary-foreground/85">{breadcrumbs}</div>
              ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>
    </div>
  );
}
