import type { ReactNode } from 'react'

import { NavBar } from '@/components/layout/NavBar'

export default function ClubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar showSearch={false} mode="clubs" />
      {children}
    </div>
  )
}
