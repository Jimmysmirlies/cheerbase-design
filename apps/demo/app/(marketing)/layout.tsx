import type { ReactNode } from 'react'

import { NavBar } from '@/components/layout/NavBar'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      {children}
    </div>
  )
}
