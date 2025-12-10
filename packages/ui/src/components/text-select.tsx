"use client"

import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/shadcn/select"

export type TextSelectOption = {
  value: string
  label: ReactNode
}

export type TextSelectSection = {
  label?: ReactNode
  options: TextSelectOption[]
  showDivider?: boolean
}

type TextSelectSize = "default" | "large"

type TextSelectProps = {
  value: string
  onValueChange: (value: string) => void
  options?: TextSelectOption[]
  sections?: TextSelectSection[]
  size?: TextSelectSize
  label?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  labelClassName?: string
}

// "Type Switcher": select with responsive typography and optional grouped sections.
export function TextSelect({
  value,
  onValueChange,
  options,
  sections,
  size = "large",
  label,
  triggerClassName,
  contentClassName,
  itemClassName,
  labelClassName,
}: TextSelectProps) {
  // Size palette — "Responsive Duo": default (sm trigger) vs large (md-up heading-3 metrics).
  const hasSections = Boolean(sections?.length)
  let itemCounter = 0

  const triggerSize = size === "large" ? "default" : "sm"
  const arrowSize = size === "large" ? "lg" : "default"
  const triggerTextClass = size === "large" ? "heading-3" : "heading-4"
  const itemTextClass = size === "large" ? "heading-3" : "heading-4"

  // Option renderer — "Cascade": staggers dropdown-fade animation for each item.
  const renderOptions = (list: TextSelectOption[]) =>
    list.map(option => {
      const delay = itemCounter * 60
      itemCounter += 1
      return (
        <SelectItem
          key={option.value}
          value={option.value}
          className={cn(
            "dropdown-fade-in whitespace-nowrap pr-12",
            itemTextClass,
            itemClassName,
          )}
          style={{ animationDelay: `${delay}ms` }}
        >
          {option.label}
        </SelectItem>
      )
    })

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className={cn(
          "body-small font-semibold uppercase tracking-[0.2em] text-muted-foreground",
          labelClassName
        )}>
          {label}
        </p>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
        size={triggerSize}
        arrowSize={arrowSize}
        className={cn(
          "text-primary inline-flex w-fit items-center gap-2 border-0 bg-transparent dark:bg-transparent dark:hover:bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 p-0",
          triggerTextClass,
          triggerClassName,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className={cn(
          "bg-card/90 text-foreground backdrop-blur data-[state=open]:animate-in min-w-[280px]",
          contentClassName,
        )}
      >
        {hasSections && sections
          ? sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {section.showDivider ? <SelectSeparator className="my-1" /> : null}
                <SelectGroup className="space-y-1 py-1.5">
                  {section.label ? (
                    <SelectLabel className="text-xs font-semibold uppercase tracking-[0.2em]">
                      {section.label}
                    </SelectLabel>
                  ) : null}
                  {renderOptions(section.options)}
                </SelectGroup>
              </div>
            ))
          : options
              ? renderOptions(options)
              : null}
      </SelectContent>
    </Select>
    </div>
  )
}
