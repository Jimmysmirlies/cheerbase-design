"use client";

import type React from "react";
import { motion } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

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
  /** Brand gradient key for the price text */
  gradient?: BrandGradient;
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
  gradient,
  className,
}: PricingCardProps) {
  const showOriginalPrice = originalPrice && originalPrice !== price;

  // Get gradient styling
  const gradientConfig = gradient ? brandGradients[gradient] : null;
  const gradientCss = gradientConfig?.css;
  const firstGradientColor = gradientCss?.match(/#[0-9A-Fa-f]{6}/)?.[0];

  const priceGradientStyle: React.CSSProperties | undefined = gradient
    ? {
        backgroundImage: gradientCss,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
      }
    : undefined;

  return (
    <motion.div
      className={cn(
        "relative rounded-lg border p-5 overflow-hidden cursor-pointer",
        !gradient && "border-border/60 bg-card",
        className,
      )}
      style={
        gradient && firstGradientColor
          ? { borderColor: `${firstGradientColor}50` }
          : undefined
      }
      whileHover={{
        y: -2,
        boxShadow:
          gradient && firstGradientColor
            ? `0 8px 20px -6px ${firstGradientColor}25`
            : "0 8px 20px -6px rgba(0, 0, 0, 0.1)",
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Gradient background overlay */}
      {gradient && gradientCss && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: gradientCss,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ opacity: 0.03 }}
          whileHover={{ opacity: 0.06 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <div className="relative z-10">
        <div className="flex flex-col gap-1">
          <p className="body-small font-semibold text-foreground">{label}</p>
          {subtitle && (
            <p className="body-small text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span
            className={cn(
              "heading-3 font-bold",
              !gradient && "text-foreground",
            )}
            style={priceGradientStyle}
          >
            {price}
          </span>
          {showOriginalPrice && (
            <span className="body-text text-muted-foreground line-through">
              {originalPrice}
            </span>
          )}
          <span className="body-small text-muted-foreground">{unit}</span>
        </div>
      </div>
    </motion.div>
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
