import { cn } from "@workspace/ui/lib/utils";

import {
  brandGradients,
  noiseTextureLight,
  type BrandGradient,
} from "@/lib/gradients";

const sizeClasses = {
  sm: "size-10 text-base",
  md: "size-12 text-lg",
  lg: "size-14 text-xl",
} as const;

export type AvatarSize = keyof typeof sizeClasses;

type GradientAvatarProps = {
  /** The name to derive the initial from */
  name: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Brand gradient key or custom Tailwind gradient classes */
  gradient?: BrandGradient | string;
  /** Whether to include noise texture overlay */
  withNoise?: boolean;
  /** Additional className */
  className?: string;
};

/**
 * Generates a consistent gradient based on a string (name)
 */
export function getGradientForName(name: string): BrandGradient {
  const gradientKeys = Object.keys(brandGradients) as BrandGradient[];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradientKeys.length;
  return gradientKeys[index]!;
}

/**
 * Get tailwind gradient classes for a brand gradient key
 */
function getGradientClasses(gradient: BrandGradient | string): string {
  // Check if it's a brand gradient key
  if (gradient in brandGradients) {
    return brandGradients[gradient as BrandGradient].tailwind;
  }
  // Otherwise treat as custom tailwind classes
  return gradient;
}

export function GradientAvatar({
  name,
  size = "lg",
  gradient,
  withNoise = true,
  className,
}: GradientAvatarProps) {
  const initial = name.slice(0, 1).toUpperCase();

  // Resolve gradient classes
  const resolvedGradient = gradient ?? getGradientForName(name);
  const gradientClasses = getGradientClasses(resolvedGradient);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white overflow-hidden",
        sizeClasses[size],
        gradientClasses,
        className,
      )}
    >
      {withNoise ? (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            backgroundImage: noiseTextureLight,
            backgroundRepeat: "repeat",
          }}
          aria-hidden
        />
      ) : null}
      <span className="relative z-10">{initial}</span>
    </div>
  );
}

export { brandGradients };
