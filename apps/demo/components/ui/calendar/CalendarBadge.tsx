import { CalendarDaysIcon } from 'lucide-react'

type CalendarBadgeProps = {
  monthLabel: string
  dayLabel: string
  className?: string
}

export function CalendarBadge({ monthLabel, dayLabel, className }: CalendarBadgeProps) {
  return (
    <div className={`bg-card border-border text-primary flex w-32 flex-col overflow-hidden rounded-2xl border shadow-sm ${className ?? ''}`}>
      <div className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
        <CalendarDaysIcon className="size-4" />
        <span>{monthLabel}</span>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-3">
        <span className="text-3xl font-bold">{dayLabel}</span>
      </div>
    </div>
  )
}

