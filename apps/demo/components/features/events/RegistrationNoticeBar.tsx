/**
 * Registration Notice Bar Component
 *
 * Displays the current registration phase status with gradient styling
 */

import { brandGradients, type BrandGradient } from "@/lib/gradients";

interface RegistrationNoticeBarProps {
  title: string;
  subtitle: string;
  /** Brand gradient variant to apply */
  gradient?: BrandGradient;
  /** Manual gradient CSS override (takes precedence over gradient prop) */
  gradientCss?: string;
  /** Manual border color override (takes precedence over gradient prop) */
  borderColor?: string;
  /** Manual dot color override (takes precedence over gradient prop) */
  dotColor?: string;
}

export function RegistrationNoticeBar({
  title,
  subtitle,
  gradient,
  gradientCss: manualGradientCss,
  borderColor: manualBorderColor,
  dotColor: manualDotColor,
}: RegistrationNoticeBarProps) {
  // Use manual overrides if provided, otherwise derive from gradient prop
  const gradientConfig = gradient ? brandGradients[gradient] : undefined;
  const gradientCss = manualGradientCss ?? gradientConfig?.css;
  const firstColor = gradientCss?.match(/#[0-9A-Fa-f]{6}/)?.[0];
  const borderColor = manualBorderColor ?? firstColor;
  const dotColor = manualDotColor ?? firstColor;

  const hasGradient = !!gradientCss && !!borderColor && !!dotColor;

  return (
    <div
      className="relative rounded-md border p-4 transition-all overflow-hidden"
      style={
        hasGradient && borderColor
          ? {
              borderColor: `${borderColor}50`,
            }
          : undefined
      }
    >
      {/* Gradient background overlay */}
      {hasGradient && gradientCss && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: gradientCss,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div className="relative z-10 flex items-center gap-3">
        {/* Status indicator dot */}
        <div
          className="size-2.5 shrink-0 rounded-full"
          style={
            hasGradient && dotColor
              ? {
                  backgroundColor: dotColor,
                }
              : undefined
          }
        />
        <div className="flex items-start gap-x-2 gap-y-0 flex-1 flex-wrap leading-tight">
          <p className="body-text font-semibold text-foreground leading-tight">
            {title}
          </p>
          {subtitle && (
            <>
              <span className="body-text text-muted-foreground leading-tight">
                •
              </span>
              <p className="body-text text-muted-foreground leading-tight">
                {subtitle}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
