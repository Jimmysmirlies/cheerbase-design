import Link from 'next/link'
import { PaletteIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

type StyleGuideButtonProps = {
  className?: string
}

export function StyleGuideButton({ className }: StyleGuideButtonProps) {
  return (
    <Link
      href="/style-guide"
      className={cn(
        'group fixed bottom-[84px] right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/90 px-4 py-2 text-sm font-semibold text-foreground shadow-lg shadow-black/10 backdrop-blur supports-[backdrop-filter]:bg-card/80 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6 lg:bottom-6',
        className
      )}
      aria-label="Open the style guide"
    >
      <PaletteIcon className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
      <span>Style Guide</span>
    </Link>
  )
}
