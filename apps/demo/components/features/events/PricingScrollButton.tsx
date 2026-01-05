'use client'

import type { ReactNode } from 'react'

import { Button } from '@workspace/ui/shadcn/button'

type PricingScrollButtonProps = {
  targetId: string
  children: ReactNode
  className?: string
}

export function PricingScrollButton({ targetId, children, className }: PricingScrollButtonProps) {
  const handleClick = () => {
    const section = document.getElementById(targetId)
    if (!section) return

    const NAV_HEIGHT = 88

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

  return (
    <Button type="button" variant="outline" className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
