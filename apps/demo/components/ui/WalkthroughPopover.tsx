'use client'

/**
 * WalkthroughPopover
 * 
 * A reusable component for creating interactive walkthroughs and tutorials.
 * Features:
 * - Dark overlay with backdrop blur to focus attention
 * - Popover content with title, description, and custom content
 * - LocalStorage persistence to remember if user has seen the walkthrough
 * - Auto-positioning based on trigger element
 * - Smooth animations
 * 
 * Usage:
 * ```tsx
 * <WalkthroughPopover
 *   storageKey="my-feature-walkthrough"
 *   title="New Feature"
 *   description="This feature lets you do amazing things."
 *   side="bottom"
 *   align="end"
 * >
 *   <Button>Click me</Button>
 * </WalkthroughPopover>
 * ```
 */

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/shadcn/popover'
import { Button } from '@workspace/ui/shadcn/button'
import { cn } from '@workspace/ui/lib/utils'

export type WalkthroughStep = {
  icon?: ReactNode
  label: string
}

export type WalkthroughPopoverProps = {
  /** Unique key for localStorage persistence */
  storageKey: string
  /** Title of the walkthrough popover */
  title: string
  /** Description text */
  description: string
  /** Optional list of steps/features to highlight */
  steps?: WalkthroughStep[]
  /** Custom content to render instead of/after steps */
  children: ReactNode
  /** Custom content for the popover body (replaces default description + steps) */
  popoverContent?: ReactNode
  /** Side of the trigger to show the popover */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end'
  /** Offset from the trigger element */
  sideOffset?: number
  /** Text for the dismiss button */
  dismissText?: string
  /** Delay before showing the walkthrough (ms) */
  delay?: number
  /** Whether to show the walkthrough (controlled mode) */
  open?: boolean
  /** Callback when walkthrough is dismissed */
  onDismiss?: () => void
  /** Whether to persist the "seen" state to localStorage */
  persist?: boolean
  /** Class name for the trigger wrapper */
  triggerClassName?: string
  /** Whether the trigger should have highlight styling when popover is open */
  highlightTrigger?: boolean
  /** Custom highlight styles for the trigger */
  highlightClassName?: string
}

export function WalkthroughPopover({
  storageKey,
  title,
  description,
  steps,
  children,
  popoverContent,
  side = 'bottom',
  align = 'end',
  sideOffset = 12,
  dismissText = 'Got it',
  delay = 800,
  open: controlledOpen,
  onDismiss,
  persist = true,
  triggerClassName,
  highlightTrigger = true,
  highlightClassName,
}: WalkthroughPopoverProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const [triggerPosition, setTriggerPosition] = useState<{ top: number; right: number; left: number; bottom: number } | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const isOpen = isControlled ? controlledOpen : internalOpen

  // Track the trigger's position for when we portal it
  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setTriggerPosition({
          top: rect.top,
          right: window.innerWidth - rect.right,
          left: rect.left,
          bottom: rect.bottom,
        })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [])

  // Check localStorage and show walkthrough if not seen
  useEffect(() => {
    if (isControlled) return

    const hasSeen = persist ? localStorage.getItem(storageKey) : false
    if (!hasSeen) {
      const timer = setTimeout(() => setInternalOpen(true), delay)
      return () => clearTimeout(timer)
    }
  }, [storageKey, delay, persist, isControlled])

  const dismiss = () => {
    if (isControlled) {
      onDismiss?.()
    } else {
      setInternalOpen(false)
      if (persist) {
        localStorage.setItem(storageKey, 'true')
      }
      onDismiss?.()
    }
  }

  const defaultHighlightClassName = 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent'

  const triggerContent = (
    <div
      ref={triggerRef}
      className={cn(
        'inline-flex transition-all duration-300',
        isOpen && highlightTrigger && (highlightClassName || defaultHighlightClassName),
        triggerClassName
      )}
    >
      {children}
    </div>
  )

  const popover = (
    <Popover open={isOpen} onOpenChange={open => !open && dismiss()}>
      <PopoverTrigger asChild>{triggerContent}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 w-72 rounded-lg border-border/70 bg-card p-0 shadow-lg"
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <button
              onClick={dismiss}
              className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          
          {popoverContent ? (
            popoverContent
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{description}</p>
              
              {steps && steps.length > 0 && (
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {step.icon ? (
                        <span className="flex size-5 items-center justify-center">{step.icon}</span>
                      ) : null}
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          <Button size="sm" onClick={dismiss} className="mt-1">
            {dismissText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )

  // When walkthrough is showing, portal both overlay and content for proper z-index layering
  if (isOpen && typeof document !== 'undefined' && triggerPosition) {
    // Calculate the fixed position based on side/align
    let fixedStyle: React.CSSProperties = {}
    
    if (side === 'bottom' || side === 'top') {
      fixedStyle = { top: triggerPosition.top, right: triggerPosition.right }
    } else if (side === 'left') {
      fixedStyle = { top: triggerPosition.top, left: triggerPosition.left }
    } else {
      fixedStyle = { top: triggerPosition.top, right: triggerPosition.right }
    }

    return (
      <>
        {/* Placeholder to maintain layout space */}
        <div ref={triggerRef} className="inline-flex opacity-0 pointer-events-none">
          {children}
        </div>
        {createPortal(
          <>
            {/* Dark overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] animate-in fade-in-0 duration-300"
              onClick={dismiss}
              aria-hidden="true"
            />
            {/* Content fixed at exact position, above overlay */}
            <div className="fixed z-50" style={fixedStyle}>
              {popover}
            </div>
          </>,
          document.body
        )}
      </>
    )
  }

  return popover
}

/**
 * Hook to manage walkthrough state programmatically
 */
export function useWalkthrough(storageKey: string, options?: { persist?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const persist = options?.persist ?? true

  useEffect(() => {
    const hasSeen = persist ? localStorage.getItem(storageKey) : false
    if (!hasSeen) {
      setIsOpen(true)
    }
  }, [storageKey, persist])

  const dismiss = () => {
    setIsOpen(false)
    if (persist) {
      localStorage.setItem(storageKey, 'true')
    }
  }

  const reset = () => {
    localStorage.removeItem(storageKey)
    setIsOpen(true)
  }

  const show = () => setIsOpen(true)

  return {
    isOpen,
    dismiss,
    reset,
    show,
  }
}

/**
 * WalkthroughStepBadge - Helper component for rendering step badges
 */
export function WalkthroughStepBadge({ 
  children,
  className,
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <span 
      className={cn(
        "flex size-5 items-center justify-center rounded bg-muted font-semibold text-foreground text-xs",
        className
      )}
    >
      {children}
    </span>
  )
}

