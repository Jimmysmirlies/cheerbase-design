"use client";

import { cn } from "@workspace/ui/lib/utils";

export type PricingCardProps = {
  /** Division or tier label (e.g., "Senior / Open") */
  label: string;
  /** Subtitle text (e.g., "Ages 15+") */
  subtitle?: string;
  /** Current/discounted price */
  price: string;
  /** Original price (shown with strikethrough when different from price) */
  originalPrice?: string;
  /** Unit label (e.g., "/ athlete", "/ team") */
  unit?: string;
  /** Additional CSS classes */
  className?: string;
};

/**
 * PricingCard
 *
 * A reusable card for displaying pricing information with optional
 * early bird/discount pricing. Used in event detail pages to show
 * per-division pricing.
 */
export function PricingCard({
  label,
  subtitle,
  price,
  originalPrice,
  unit = "/ athlete",
  className,
}: PricingCardProps) {
  const showOriginalPrice = originalPrice && originalPrice !== price;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card p-5",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="body-small font-semibold text-foreground">{label}</p>
        {subtitle && (
          <p className="body-small text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="heading-4 font-semibold text-foreground">{price}</span>
        {showOriginalPrice && (
          <span className="body-text text-muted-foreground line-through">
            {originalPrice}
          </span>
        )}
        <span className="body-small text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export type PricingCardGridProps = {
  /** Array of pricing card data */
  cards: PricingCardProps[];
  /** Empty state message when no cards */
  emptyMessage?: string;
  /** Additional CSS classes for the grid container */
  className?: string;
};

/**
 * PricingCardGrid
 *
 * A responsive grid layout for displaying multiple PricingCard components.
 * Includes an empty state when no pricing data is available.
 */
export function PricingCardGrid({
  cards,
  emptyMessage = "Pricing information will be available soon.",
  className,
}: PricingCardGridProps) {
  if (!cards.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-6 text-center">
        <p className="body-small text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {cards.map((card) => (
        <PricingCard key={card.label} {...card} />
      ))}
    </div>
  );
}
