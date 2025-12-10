'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          // Success toast colors (green)
          '--success-bg': '#f0fdf4',
          '--success-text': '#14532d',
          '--success-border': '#bbf7d0',
          // Error toast colors (red)
          '--error-bg': '#fef2f2',
          '--error-text': '#7f1d1d',
          '--error-border': '#fecaca',
        } as React.CSSProperties
      }
      position="top-center"
      {...props}
    />
  )
}

export { Toaster }
export { toast } from 'sonner'
