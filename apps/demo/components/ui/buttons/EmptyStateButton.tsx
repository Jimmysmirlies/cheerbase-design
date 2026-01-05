'use client'

import { PlusIcon } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { ReactNode, CSSProperties } from 'react'

type EmptyStateButtonProps = {
  /** Primary text displayed in the button */
  title: string
  /** Secondary descriptive text */
  description?: string
  /** Click handler */
  onClick?: () => void
  /** Custom icon to display (defaults to PlusIcon) */
  icon?: ReactNode
  /** Additional className for the outer button */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

// Spaced dashed border styles using strokeDasharray
const spacedDashStyle: CSSProperties = {
  strokeDasharray: '6 6',
}

/**
 * A dashed-border button used to indicate empty states and prompt users to add content.
 * Common use cases: adding items to lists, creating new entries, uploading files.
 */
export function EmptyStateButton({
  title,
  description,
  onClick,
  icon,
  className,
  disabled = false,
}: EmptyStateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-md p-8 transition-all text-left w-full group',
        !disabled && 'hover:bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* SVG border with spaced dashes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="5.5"
          ry="5.5"
          fill="none"
          className={cn(
            'stroke-border transition-colors',
            !disabled && 'group-hover:stroke-primary/50'
          )}
          strokeWidth="1"
          style={spacedDashStyle}
        />
      </svg>
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            'size-8 shrink-0 rounded-full flex items-center justify-center relative'
          )}
        >
          {/* SVG circular border with spaced dashes */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <circle
              cx="50%"
              cy="50%"
              r="15"
              fill="none"
              className={cn(
                'stroke-border transition-colors',
                !disabled && 'group-hover:stroke-primary/50'
              )}
              strokeWidth="1"
              style={spacedDashStyle}
            />
          </svg>
          {icon || (
            <PlusIcon
              className={cn(
                'size-4 text-muted-foreground',
                !disabled && 'group-hover:text-primary'
              )}
            />
          )}
        </div>
        <div className="flex flex-col">
          <p
            className={cn(
              'body-text font-semibold text-muted-foreground',
              !disabled && 'group-hover:text-foreground'
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </button>
  )
}
