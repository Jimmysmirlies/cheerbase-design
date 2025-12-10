import type { ReactNode } from 'react'

import '@workspace/ui/globals.css'

import type { Metadata } from 'next'
import './globals.css'
import { StyleGuideButton } from '@/components/layout/StyleGuideButton'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { WalkthroughProvider, WalkthroughFloatingTrigger } from '@/components/ui/RegistrationWalkthrough'
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
          <WalkthroughProvider>
            {children}
            <WalkthroughFloatingTrigger />
            <StyleGuideButton />
            <Toaster
              position="top-center"
              toastOptions={{
                classNames: {
                  toast: 'border shadow-lg',
                  title: 'font-semibold',
                  description: 'text-sm',
                  actionButton: 'font-medium',
                  success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/50 dark:border-green-800 dark:text-green-100 [&_[data-description]]:text-green-800 dark:[&_[data-description]]:text-green-200',
                  error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-800 dark:text-red-100 [&_[data-description]]:text-red-800 dark:[&_[data-description]]:text-red-200',
                  info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-100 [&_[data-description]]:text-blue-800 dark:[&_[data-description]]:text-blue-200',
                },
              }}
            />
          </WalkthroughProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
