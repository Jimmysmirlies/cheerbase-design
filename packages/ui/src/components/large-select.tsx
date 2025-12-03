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

export type LargeSelectOption = {
  value: string
  label: ReactNode
}

export type LargeSelectSection = {
  label?: ReactNode
  options: LargeSelectOption[]
  showDivider?: boolean
}

type LargeSelectProps = {
  value: string
  onValueChange: (value: string) => void
  options?: LargeSelectOption[]
  sections?: LargeSelectSection[]
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
}

export function LargeSelect({
  value,
  onValueChange,
  options,
  sections,
  triggerClassName,
  contentClassName,
  itemClassName,
}: LargeSelectProps) {
  const hasSections = Boolean(sections?.length)
  let itemCounter = 0

  const renderOptions = (list: LargeSelectOption[]) =>
    list.map(option => {
      const delay = itemCounter * 60
      itemCounter += 1
      return (
        <SelectItem
          key={option.value}
          value={option.value}
          className={cn("dropdown-fade-in text-xl font-semibold", itemClassName)}
          style={{ animationDelay: `${delay}ms` }}
        >
          {option.label}
        </SelectItem>
      )
    })

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        arrowSize="lg"
        className={cn(
          "text-primary inline-flex w-fit items-center gap-2 border-0 bg-transparent text-2xl font-semibold shadow-none focus:ring-0 focus:ring-offset-0 p-0",
          triggerClassName,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className={cn("bg-card/90 text-foreground backdrop-blur data-[state=open]:animate-in", contentClassName)}>
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
  )
}
