'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type ClubPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  hideSubtitle?: boolean;
  hideTitle?: boolean;
  eventStartDate?: string | Date;
  breadcrumbs?: ReactNode;
  metadataItems?: { label: string; value: ReactNode }[];
  metadataColumns?: number;
};

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

type CountdownDisplay =
  | {
      state: "future";
      segments: {
        days: number;
        hours: number;
        seconds: number;
      };
    }
  | { state: "past" };

function getEventCountdown(eventStartDate?: string | Date): CountdownDisplay | null {
  if (!eventStartDate) return null;
  const start = new Date(eventStartDate);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  if (diffMs <= 0) return { state: "past" };

  const days = Math.floor(diffMs / DAY_IN_MS);
  const remainingAfterDays = diffMs % DAY_IN_MS;
  const hours = Math.floor(remainingAfterDays / HOUR_IN_MS);
  const remainingAfterHours = remainingAfterDays % HOUR_IN_MS;
  const seconds = Math.floor((remainingAfterHours % MINUTE_IN_MS) / SECOND_IN_MS);

  return {
    state: "future",
    segments: {
      days,
      hours,
      seconds,
    },
  };
}

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
  eventStartDate,
  breadcrumbs,
  metadataItems,
  metadataColumns = 3,
}: ClubPageHeaderProps) {
  const [eventCountdown, setEventCountdown] = useState(() => getEventCountdown(eventStartDate));

  useEffect(() => {
    setEventCountdown(getEventCountdown(eventStartDate));
    if (!eventStartDate) return;

    const interval = window.setInterval(() => {
      setEventCountdown(getEventCountdown(eventStartDate));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [eventStartDate]);

  const countdownSegments =
    eventCountdown && eventCountdown.state === "future"
      ? [
          { label: "Days", value: eventCountdown.segments.days },
          { label: "Hours", value: eventCountdown.segments.hours },
          { label: "Secs", value: eventCountdown.segments.seconds },
        ]
      : null;

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/70 backdrop-blur-sm"
      style={gradientStyle}
    >
      <header className="flex min-h-[240px] w-full max-w-full flex-col justify-end px-4 pb-8 pt-18 lg:mx-auto lg:max-w-6xl lg:px-8">
        <div className="flex flex-col justify-end gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              {breadcrumbs ? (
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground/80">
                  {breadcrumbs}
                </div>
              ) : null}
              {!hideTitle ? <h1 className="heading-2 text-primary-foreground">{title}</h1> : null}
            </div>
            {eventCountdown || action ? (
              <div className="flex w-full flex-col items-end gap-4 sm:flex-row sm:items-end sm:justify-end sm:gap-6 lg:w-auto lg:flex-col">
                {eventCountdown ? (
                  eventCountdown.state === "past" ? (
                    <div className="text-right text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                      Event Passed
                    </div>
                  ) : countdownSegments ? (
                    <div className="flex flex-col items-end text-primary-foreground">
                      <div className="grid grid-flow-col items-end gap-5">
                        {countdownSegments.map(segment => (
                          <div key={segment.label} className="flex flex-col items-center text-right">
                            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
                              {segment.label}
                            </span>
                            <span className="heading-2 leading-none">
                              {segment.value.toString().padStart(2, "0")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                ) : null}
                {action ? <div className="shrink-0">{action}</div> : null}
              </div>
            ) : null}
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
