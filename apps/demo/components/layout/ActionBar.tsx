'use client'

import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { TagTabs, type TagTab } from '@/components/ui/controls/TagTabs'
import { useLayoutContextSafe } from '@/components/providers/LayoutProvider'

type ActionBarProps = {
  /** Tabs to display on the left side */
  tabs?: TagTab[]
  /** Currently active tab ID */
  activeTab?: string
  /** Callback when tab changes */
  onTabChange?: (tab: string) => void
  /** Custom left content (filters, selects, etc.) - shown instead of tabs if no tabs provided */
  leftContent?: ReactNode
  /** Action buttons or controls to display on the right side */
  actions?: ReactNode
  /** Status badge or indicator to display */
  status?: ReactNode
  /** Whether the bar should be sticky */
  sticky?: boolean
  /** Additional class names */
  className?: string
  /** Max width variant */
  maxWidth?: 'default' | 'full'
}

export function ActionBar({
  tabs,
  activeTab,
  onTabChange,
  leftContent,
  actions,
  status,
  sticky = true,
  className,
  maxWidth = 'default',
}: ActionBarProps) {
  const { layout } = useLayoutContextSafe()
  const isLayoutB = layout === 'B'

  const hasTabs = tabs && tabs.length > 0
  const hasLeftContent = hasTabs || leftContent
  const hasRightContent = actions || status

  // Don't render if there's no content
  if (!hasLeftContent && !hasRightContent) {
    return null
  }

  return (
    <div
      className={cn(
        'z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        !isLayoutB && 'border-b border-border',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6',
          maxWidth === 'default' && 'max-w-7xl'
        )}
      >
        {/* Left side: Tabs or custom content */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {hasTabs && onTabChange && activeTab ? (
            <TagTabs
              tabs={tabs}
              value={activeTab}
              onValueChange={onTabChange}
            />
          ) : (
            leftContent
          )}
        </div>

        {/* Right side: Status + Actions */}
        {hasRightContent && (
          <div className="flex shrink-0 items-center gap-3">
            {status}
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export type { TagTab as ActionBarTab }

