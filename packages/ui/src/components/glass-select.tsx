"use client"

import { ReactNode } from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/shadcn/select";

export type GlassSelectOption = { value: string; label: ReactNode };

type GlassSelectProps = {
  value: string;
  onValueChange: (val: string) => void;
  options: GlassSelectOption[];
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
};

/**
 * Glass-style select trigger with soft border, card background, and dropdown-fade animation.
 * Reuse anywhere you want the pill/“glass” select look.
 */
export function GlassSelect({
  value,
  onValueChange,
  options,
  className,
  triggerClassName,
  itemClassName,
}: GlassSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "!h-10 min-w-[200px] rounded-md border border-border/50 bg-card body-text font-semibold shadow-sm",
          triggerClassName,
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-card/90 text-foreground shadow-lg data-[state=open]:animate-in">
        {options.map((opt, idx) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={cn("dropdown-fade-in body-text", itemClassName)}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
