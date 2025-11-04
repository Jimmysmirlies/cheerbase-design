import { Slot } from '@radix-ui/react-slot'

import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { type VariantProps, cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        green:
          'bg-green-100 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100',
        red: 'bg-red-100 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100',
        amber:
          'bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100',
        blue: 'bg-blue-100 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
        olivine:
          'bg-[var(--olivine-50)] border-[var(--olivine-100)] text-[var(--olivine-text)] dark:bg-[var(--olivine-900)]/20 dark:border-[var(--olivine-800)] dark:text-[var(--olivine-100)]',
        lilac:
          'bg-[var(--lilac-50)] border-[var(--lilac-100)] text-[var(--lilac-text)] dark:bg-[var(--lilac-900)]/20 dark:border-[var(--lilac-800)] dark:text-[var(--lilac-100)]',
        coral:
          'bg-[var(--light-coral-50)] border-[var(--light-coral-100)] text-[var(--light-coral-text)] dark:bg-[var(--light-coral-900)]/20 dark:border-[var(--light-coral-800)] dark:text-[var(--light-coral-100)]',
        charcoal:
          'bg-[var(--charcoal-50)] border-[var(--charcoal-100)] text-[var(--charcoal-text)] dark:bg-[var(--charcoal-900)]/20 dark:border-[var(--charcoal-800)] dark:text-[var(--charcoal-100)]',
        cadetGray:
          'bg-[var(--cadet-gray-50)] border-[var(--cadet-gray-100)] text-[var(--cadet-gray-text)] dark:bg-[var(--cadet-gray-900)]/20 dark:border-[var(--cadet-gray-800)] dark:text-[var(--cadet-gray-100)]',
        mustard:
          'bg-[var(--mustard-50)] border-[var(--mustard-100)] text-[var(--mustard-text)] dark:bg-[var(--mustard-900)]/20 dark:border-[var(--mustard-800)] dark:text-[var(--mustard-100)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
