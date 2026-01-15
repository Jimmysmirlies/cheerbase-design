import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { IconBox } from "./IconBox";
import type { BrandGradient } from "@/lib/gradients";

export type QuickActionCardProps = {
  /** Destination URL */
  href: string;
  /** Icon to display in the IconBox */
  icon: ReactNode;
  /** Primary title text */
  title: string;
  /** Secondary description text */
  description: string;
  /** Brand gradient key for IconBox theming */
  gradient?: BrandGradient;
};

/**
 * QuickActionCard
 *
 * A full-width card for call-to-action navigation items.
 * Features an IconBox, title, description, and arrow indicator.
 * Use for dashboard quick actions or navigation lists.
 */
export function QuickActionCard({
  href,
  icon,
  title,
  description,
  gradient,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block">
      <div className="flex items-center gap-4 rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/50">
        <IconBox icon={icon} gradient={gradient} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRightIcon className="size-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
