import type { ReactNode } from 'react'

import { NavBar } from '@/components/layout/NavBar'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        {children}
      </div>
    </SmoothScrollProvider>
  )
}
