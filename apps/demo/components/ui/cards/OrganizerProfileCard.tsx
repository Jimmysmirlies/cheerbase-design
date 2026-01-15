"use client";

import { cn } from "@workspace/ui/lib/utils";

import {
  GradientAvatar,
  type AvatarSize,
} from "@/components/ui/GradientAvatar";
import type { BrandGradient } from "@/lib/gradients";

type OrganizerProfileCardProps = {
  name: string;
  subtitle?: string;
  gradient?: BrandGradient;
  avatarSize?: AvatarSize;
  className?: string;
};

export function OrganizerProfileCard({
  name,
  subtitle,
  gradient,
  avatarSize = "md",
  className,
}: OrganizerProfileCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/60 bg-muted/50 p-3",
        className,
      )}
    >
      <GradientAvatar name={name} gradient={gradient} size={avatarSize} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
