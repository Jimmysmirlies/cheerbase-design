import type { ReactNode } from 'react'

import '@workspace/ui/globals.css'

import type { Metadata } from 'next'
import Link from 'next/link'

import './globals.css'
import { Toaster } from '@workspace/ui/shadcn/sonner'

export const metadata: Metadata = {
  title: 'cheerbase',
  description: 'A clean starting point for experimenting with the Showcase design system.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
        <Toaster />
        <Link
          className="bg-primary text-primary-foreground hover:bg-primary/90 fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition"
          href="/style-guide"
        >
          Style Guide
          <span aria-hidden>↗</span>
        </Link>
      </body>
    </html>
  )
}
