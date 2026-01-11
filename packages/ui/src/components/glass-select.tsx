"use client";

import { ReactNode } from "react";

import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/shadcn/select";

export type GlassSelectOption =
  | { value: string; label: ReactNode }
  | { type: "separator" };

function isSeparator(opt: GlassSelectOption): opt is { type: "separator" } {
  return "type" in opt && opt.type === "separator";
}

type GlassSelectProps = {
  value: string;
  onValueChange: (val: string) => void;
  options: GlassSelectOption[];
  label?: string;
  className?: string;
  triggerClassName?: string;
  itemClassName?: string;
  labelClassName?: string;
};

/**
 * Glass-style select trigger with soft border, card background, and dropdown-fade animation.
 * Reuse anywhere you want the pill/"glass" select look.
 * Supports separators by including { type: "separator" } in the options array.
 */
export function GlassSelect({
  value,
  onValueChange,
  options,
  label,
  className,
  triggerClassName,
  itemClassName,
  labelClassName,
}: GlassSelectProps) {
  let itemCounter = 0;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className={cn("label text-foreground", labelClassName)}>{label}</p>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "!h-10 min-w-[200px] rounded-md border border-border/50 bg-card body-small font-semibold shadow-sm",
            triggerClassName,
            className,
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card/90 text-foreground shadow-lg data-[state=open]:animate-in">
          {options.map((opt, idx) => {
            if (isSeparator(opt)) {
              return (
                <SelectSeparator key={`separator-${idx}`} className="my-1" />
              );
            }

            const delay = itemCounter * 60;
            itemCounter += 1;

            return (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn("dropdown-fade-in body-small", itemClassName)}
                style={{ animationDelay: `${delay}ms` }}
              >
                {opt.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
