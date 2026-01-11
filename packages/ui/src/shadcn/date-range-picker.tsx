"use client";

import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import { Calendar } from "@workspace/ui/shadcn/calendar";
import { Label } from "@workspace/ui/shadcn/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/shadcn/popover";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

export type { DateRange };

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  id?: string;
  label?: string;
  showClearButton?: boolean;
  quickSelectionsVariant?: "popover" | "inline";
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = "Pick a date range",
  disabled = false,
  fromDate,
  toDate,
  className,
  id,
  label,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (newDate: DateRange | undefined) => {
    onDateChange?.(newDate);
    // Popover stays open for easier range selection
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "bg-background hover:bg-background focus-visible:border-ring focus-visible:outline-ring/20 group w-full justify-between px-3 font-normal outline-offset-0 focus-visible:outline-[3px]",
              !date && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <span className={cn("truncate", !date && "text-muted-foreground")}>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                placeholder
              )}
            </span>
            <CalendarIcon
              size={16}
              strokeWidth={2}
              className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[264px] p-2" align="start">
          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            autoFocus
            defaultMonth={date?.from}
            disabled={(date) => {
              if (disabled) return true;
              if (fromDate && date < fromDate) return true;
              if (toDate && date > toDate) return true;
              return false;
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
