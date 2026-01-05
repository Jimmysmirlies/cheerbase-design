'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'registration-timeline', label: 'Timeline' },
  { id: 'date-location', label: 'Date & Location' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'organizer', label: 'Organizer' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'documents', label: 'Documents' },
  { id: 'results', label: 'Results' },
] as const

const NAV_HEIGHT = 88

export function EventSectionBadges() {
  const [activeSection, setActiveSection] = useState<string>('overview')
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

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    
    const section = document.getElementById(id)
    if (!section) return

    // Check if we're inside a ScrollArea component
    // Look for the ScrollArea viewport element (has data-slot="scroll-area-viewport")
    const scrollAreaViewport = document.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null
    
    if (scrollAreaViewport) {
      // We're inside a ScrollArea, scroll the viewport instead of window
      const viewportRect = scrollAreaViewport.getBoundingClientRect()
      const sectionRect = section.getBoundingClientRect()
      const scrollTop = scrollAreaViewport.scrollTop
      const top = sectionRect.top - viewportRect.top + scrollTop - NAV_HEIGHT
      scrollAreaViewport.scrollTo({ top, behavior: 'smooth' })
    } else {
      // No ScrollArea wrapper, use standard window scrolling
      const top = section.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

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
    <div className="relative flex items-center w-full max-w-full min-w-0 overflow-hidden">
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
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`
                px-3 py-1.5 body-small rounded-md border transition-all shrink-0
                ${isActive 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border'
                }
              `}
            >
              {section.label}
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

