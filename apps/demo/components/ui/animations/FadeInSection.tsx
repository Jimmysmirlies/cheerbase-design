'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@workspace/ui/lib/utils'

type FadeInSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeInSection({ children, className, delay = 0 }: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Small delay to ensure layout is settled before observing
    const timeoutId = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setIsVisible(true)
            observerRef.current?.disconnect()
          }
        },
        {
          threshold: 0.05,
          rootMargin: '50px 0px 0px 0px', // Trigger slightly before element enters viewport from top
        }
      )

      observerRef.current.observe(element)
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      observerRef.current?.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
