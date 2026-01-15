import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

export type IconBoxProps = {
  /** The icon to display */
  icon: ReactNode;
  /** Brand gradient key for styling */
  gradient?: BrandGradient;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
};

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
};

const iconSizeClasses = {
  sm: "[&>svg]:size-4",
  md: "[&>svg]:size-5",
  lg: "[&>svg]:size-6",
};

/**
 * IconBox
 *
 * A styled container for icons with optional gradient theming.
 * When a gradient is provided, the background uses a light tint
 * and the icon uses the prominent (first) color from the gradient.
 */
export function IconBox({
  icon,
  gradient,
  size = "md",
  className,
}: IconBoxProps) {
  const gradientConfig = gradient ? brandGradients[gradient] : null;
  const gradientCss = gradientConfig?.css;
  const primaryColor = gradientCss?.match(/#[0-9A-Fa-f]{6}/)?.[0];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg",
        sizeClasses[size],
        iconSizeClasses[size],
        !gradient && "bg-muted text-muted-foreground",
        className
      )}
      style={
        gradient && primaryColor
          ? {
              backgroundColor: `${primaryColor}10`,
              color: primaryColor,
            }
          : undefined
      }
    >
      {icon}
    </div>
  );
}
