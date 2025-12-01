'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'

import * as React from 'react'

import { cn } from '@workspace/ui/lib/utils'

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex h-11 w-11 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  const gradientStyle = {
    backgroundColor: 'hsla(0,0%,100%,1)',
    backgroundImage: [
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.5' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")",
      'linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)',
    ].join(','),
    backgroundRepeat: 'repeat, no-repeat',
    backgroundSize: 'auto, auto',
    backgroundBlendMode: 'soft-light, normal',
  } as React.CSSProperties

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full text-primary-foreground',
        className
      )}
      style={{ ...gradientStyle, ...(style || {}) }}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
