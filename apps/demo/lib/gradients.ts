/**
 * Unified Brand Gradient System
 *
 * Provides consistent gradient definitions for use across the application.
 * Each gradient includes both CSS (for backgrounds) and Tailwind (for avatars) versions.
 *
 * Usage:
 * - Page headers: use `brandGradients.{key}.css`
 * - Avatars: use `brandGradients.{key}.tailwind`
 */

export const brandGradients = {
  primary: {
    name: "Purple Blue",
    css: "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)",
    tailwind: "from-violet-400 via-indigo-500 to-blue-500",
  },
  teal: {
    name: "Teal Cyan",
    css: "linear-gradient(160deg, #0D9488 0%, #0891B2 50.22%, #06B6D4 100%)",
    tailwind: "from-teal-400 via-teal-500 to-cyan-500",
  },
  blue: {
    name: "Ocean Blue",
    css: "linear-gradient(160deg, #2563EB 0%, #3B82F6 50.22%, #60A5FA 100%)",
    tailwind: "from-blue-400 via-blue-500 to-blue-600",
  },
  mustard: {
    name: "Golden Mustard",
    css: "linear-gradient(160deg, #CA8A04 0%, #EAB308 50.22%, #FACC15 100%)",
    tailwind: "from-amber-400 via-amber-500 to-yellow-500",
  },
  red: {
    name: "Rose Red",
    css: "linear-gradient(160deg, #BE123C 0%, #E11D48 50.22%, #F43F5E 100%)",
    tailwind: "from-rose-400 via-rose-500 to-rose-600",
  },
  orange: {
    name: "Sunset Orange",
    css: "linear-gradient(160deg, #C2410C 0%, #EA580C 50.22%, #F97316 100%)",
    tailwind: "from-orange-400 via-orange-500 to-orange-600",
  },
  green: {
    name: "Forest Green",
    css: "linear-gradient(160deg, #15803D 0%, #16A34A 50.22%, #22C55E 100%)",
    tailwind: "from-emerald-400 via-emerald-500 to-green-500",
  },
  indigo: {
    name: "Deep Indigo",
    css: "linear-gradient(160deg, #4338CA 0%, #4F46E5 50.22%, #6366F1 100%)",
    tailwind: "from-indigo-400 via-indigo-500 to-indigo-600",
  },
  purple: {
    name: "Royal Purple",
    css: "linear-gradient(160deg, #7E22CE 0%, #9333EA 50.22%, #A855F7 100%)",
    tailwind: "from-purple-400 via-purple-500 to-purple-600",
  },
} as const;

export type BrandGradient = keyof typeof brandGradients;

/**
 * Get a gradient configuration by key
 */
export function getBrandGradient(key: BrandGradient) {
  return brandGradients[key];
}

/**
 * Get all available gradient options (useful for settings/selection UI)
 */
export function getGradientOptions() {
  return Object.entries(brandGradients).map(([key, value]) => ({
    value: key as BrandGradient,
    label: value.name,
  }));
}

/**
 * Noise texture for gradient overlays
 */
export const noiseTexture =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.5' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")";

/**
 * Noise texture variant for avatars (lighter opacity)
 */
export const noiseTextureLight =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7 0.7' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")";

/**
 * Extract the first (left-most) color from a gradient's CSS string
 */
export function getGradientStartColor(key: BrandGradient): string {
  const gradient = brandGradients[key];
  // Match the first hex color in the CSS gradient string
  const match = gradient.css.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0] : "#000000";
}
