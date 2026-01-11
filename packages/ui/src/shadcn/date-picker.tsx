"use client";

import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import { Calendar } from "@workspace/ui/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/shadcn/popover";

import { format, isBefore, isAfter, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"];
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  fromDate,
  toDate,
  className,
  captionLayout = "label",
  fromYear,
  toYear,
}: DatePickerProps) {
  // Create a disabled matcher function that disables dates outside the range
  const disabledDates = React.useMemo(() => {
    if (disabled) return true;

    const matchers: ((date: Date) => boolean)[] = [];

    if (fromDate) {
      const fromStart = startOfDay(fromDate);
      matchers.push((d: Date) => isBefore(startOfDay(d), fromStart));
    }

    if (toDate) {
      const toStart = startOfDay(toDate);
      matchers.push((d: Date) => isAfter(startOfDay(d), toStart));
    }

    if (matchers.length === 0) return undefined;

    return (d: Date) => matchers.some((matcher) => matcher(d));
  }, [disabled, fromDate, toDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          disabled={disabledDates}
          defaultMonth={date || fromDate}
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
}
