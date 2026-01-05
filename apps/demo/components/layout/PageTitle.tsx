'use client'

import type { ReactNode } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { brandGradients, type BrandGradient } from '@/lib/gradients'

type PageTitleProps = {
  /** The title text */
  title: string
  /** Gradient variant for the text */
  gradient?: BrandGradient
  /** Optional badge next to title (e.g., "Beta") */
  badge?: ReactNode
  /** Optional subtitle/description below title */
  subtitle?: string
  /** Additional className for the container */
  className?: string
}

export function PageTitle({ title, gradient = 'primary', badge, subtitle, className }: PageTitleProps) {
  const gradientConfig = brandGradients[gradient] ?? brandGradients.primary

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-3">
        <h1
          className="heading-2 bg-clip-text text-transparent"
          style={{ backgroundImage: gradientConfig.css }}
        >
          {title}
        </h1>
        {badge}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
