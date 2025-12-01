import { Slot } from '@radix-ui/react-slot'

import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { type VariantProps, cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 [&_svg]:m-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        accent: 'bg-accent text-accent-foreground shadow-xs hover:bg-accent/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        gradient:
          "relative overflow-hidden border border-border/70 bg-white text-primary-foreground shadow-sm transition duration-200 filter hover:shadow-md hover:saturate-150 hover:brightness-95",
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        'ghost-success': 'text-success hover:bg-success/10 hover:text-success focus-visible:ring-success/20',
        'ghost-destructive': 'text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-destructive/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const { style, ...restProps } = props
  const Comp = asChild ? Slot : 'button'

  const gradientStyle =
    variant === 'gradient'
      ? {
          backgroundColor: 'hsla(0,0%,100%,1)',
          backgroundImage: [
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.5' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")",
            'linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)',
          ].join(','),
          backgroundRepeat: 'repeat, no-repeat',
          backgroundSize: 'auto, auto',
          backgroundBlendMode: 'soft-light, normal',
        }
      : undefined

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={gradientStyle ? { ...gradientStyle, ...(style || {}) } : style}
      {...restProps}
    />
  )
}

export { Button, buttonVariants }
