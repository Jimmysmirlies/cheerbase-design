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
    const top = section.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT

    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <Button type="button" variant="outline" className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
