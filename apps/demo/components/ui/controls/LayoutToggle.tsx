'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'

type TutorialItem = {
  label: string
  description: string
}

type LayoutToggleProps<T extends string> = {
  /** Array of variant labels (e.g., ['A', 'B'] or ['A', 'B', 'C']) */
  variants: T[]
  /** Current selected variant */
  value: T
  /** Callback when variant changes */
  onChange: (value: T) => void
  /** localStorage key for tutorial dismissal (required if showTutorial is true) */
  storageKey?: string
  /** Title for the tutorial popover */
  tutorialTitle?: string
  /** Description text for the tutorial popover */
  tutorialDescription?: string
  /** Array of items to show in the tutorial (label + description for each variant) */
  tutorialItems?: TutorialItem[]
  /** Whether to show the tutorial (defaults to true if tutorialItems provided) */
  showTutorial?: boolean
}

export function LayoutToggle<T extends string>({
  variants,
  value,
  onChange,
  storageKey,
  tutorialTitle = 'Layout Testing',
  tutorialDescription = "Switch between layout variants to compare different designs. We're testing which layout works best for this page.",
  tutorialItems,
  showTutorial: showTutorialProp,
}: LayoutToggleProps<T>) {
  const shouldShowTutorial = showTutorialProp ?? (tutorialItems && tutorialItems.length > 0)
  
  const [tutorialVisible, setTutorialVisible] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const toggleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldShowTutorial || !storageKey) return
    
    // Check if user has seen the tutorial
    const hasSeen = localStorage.getItem(storageKey)
    if (!hasSeen) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setTutorialVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [shouldShowTutorial, storageKey])

  const dismissTutorial = useCallback(() => {
    setTutorialVisible(false)
    if (storageKey) {
      localStorage.setItem(storageKey, 'true')
    }
  }, [storageKey])

  const selectedIndex = variants.indexOf(value)

  // Measure toggle position when tutorial is showing
  useEffect(() => {
    if (!tutorialVisible || !toggleRef.current) {
      return
    }

    const updatePosition = () => {
      const rect = toggleRef.current?.getBoundingClientRect()
      if (rect) {
        const width = 288 // approximate card width
        setPopoverPos({
          top: rect.bottom + 12,
          left: rect.right - width,
        })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [tutorialVisible])

  return (
    <>
      <div ref={toggleRef} className={cn('relative inline-block', tutorialVisible && 'z-50')}>
        <div
          className={cn(
            'relative inline-flex items-center rounded-md border p-1 transition-all duration-300',
            tutorialVisible
              ? 'border-white bg-white/20 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent'
              : 'border-white/30 bg-white/10'
          )}
        >
          {/* Sliding background indicator */}
          <div
            className="absolute top-1 left-1 h-7 w-7 rounded-md bg-white/20 shadow-sm transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${selectedIndex * 28}px)` }}
            aria-hidden
          />
          {variants.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => {
                onChange(v)
                if (tutorialVisible) dismissTutorial()
              }}
              className={cn(
                'relative z-10 flex size-7 items-center justify-center rounded-md text-xs font-semibold transition-colors',
                value === v ? 'text-white' : 'text-white/50 hover:text-white/70'
              )}
              aria-label={`Layout ${v}`}
              aria-pressed={value === v}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {tutorialVisible && popoverPos && tutorialItems && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-[2px] animate-in fade-in-0 duration-300"
            onClick={dismissTutorial}
            aria-hidden="true"
          />
          <div
            className="fixed z-[90] w-72 rounded-lg border-border/70 bg-card p-0 shadow-lg"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="body font-semibold text-foreground">{tutorialTitle}</p>
                <button
                  onClick={dismissTutorial}
                  className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Dismiss tutorial"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              <p className="body-small text-muted-foreground">
                {tutorialDescription}
              </p>
              <div className="flex flex-col gap-1.5 body-small text-muted-foreground">
                {tutorialItems.map((item, index) => (
                  <div key={variants[index] ?? index} className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded bg-muted font-semibold text-foreground">
                      {variants[index]}
                    </span>
                    <span>{item.description}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" onClick={dismissTutorial} className="mt-1">
                Got it
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

