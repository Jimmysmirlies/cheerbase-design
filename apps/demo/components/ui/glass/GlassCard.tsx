'use client'

import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Card } from '@workspace/ui/shadcn/card'

import { getGlassCardStyle } from './glass-card-style'

type CardElement = React.ComponentPropsWithoutRef<typeof Card>

type GlassCardProps = CardElement & {
  interactive?: boolean
  showShadow?: boolean
  emphasis?: 'default' | 'active'
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    className,
    interactive = false,
    showShadow = true,
    emphasis = 'default',
    style,
    onMouseEnter,
    onMouseLeave,
    ...props
  },
  ref
) {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) {
        setIsHovered(true)
      }
      onMouseEnter?.(event)
    },
    [interactive, onMouseEnter]
  )

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (interactive) {
        setIsHovered(false)
      }
      onMouseLeave?.(event)
    },
    [interactive, onMouseLeave]
  )

  return (
    <Card
      ref={ref}
      className={cn('overflow-hidden transition', interactive && 'cursor-pointer', className)}
      style={{
        ...getGlassCardStyle({ hovered: interactive && isHovered, showShadow, emphasis }),
        ...style,
      }}
      onMouseEnter={interactive ? handleMouseEnter : onMouseEnter}
      onMouseLeave={interactive ? handleMouseLeave : onMouseLeave}
      {...props}
    />
  )
})
