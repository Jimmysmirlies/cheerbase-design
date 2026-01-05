'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export interface TagTab {
  id: string
  label: string
}

interface TagTabsProps {
  tabs: TagTab[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function TagTabs({ tabs, value, onValueChange, className = '' }: TagTabsProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkOverflow = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1)
  }

  useEffect(() => {
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [])

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 150
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className={`relative flex items-center w-full max-w-full min-w-0 overflow-hidden ${className}`}>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scrollContainer('left')}
          className="absolute left-0 z-10 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="size-4 text-muted-foreground" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkOverflow}
        className="flex gap-2 overflow-x-auto scrollbar-hide w-full max-w-full min-w-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onValueChange(tab.id)}
              aria-pressed={isActive}
              className={`
                px-3 py-1.5 body-small rounded-md border transition-all shrink-0
                ${isActive 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border'
                }
              `}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scrollContainer('right')}
          className="absolute right-0 z-10 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

