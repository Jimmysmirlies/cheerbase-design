import type { ReactNode } from 'react'

import '@workspace/ui/globals.css'

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@workspace/ui/shadcn/sonner'

export const metadata: Metadata = {
  title: 'cheerbase',
  description: 'A clean starting point for experimenting with the Showcase design system.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
