'use client'

import { useMemo, useState } from 'react'

import Image from 'next/image'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { FALLBACK_EVENT_IMAGE } from '@/data/events/fallbacks'
import { cn } from '@workspace/ui/lib/utils'

type EventHeroCarouselProps = {
  images: string[]
  alt?: string
}

export function EventHeroCarousel({ images, alt }: EventHeroCarouselProps) {
  const gallery = useMemo(() => {
    const unique = Array.from(new Set(images.filter(Boolean)))
    return unique.length > 0 ? unique : [FALLBACK_EVENT_IMAGE]
  }, [images])

  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? prev : prev - 1))
  const handleNext = () => setActiveIndex((prev) => (prev === gallery.length - 1 ? prev : prev + 1))

  return (
    <section className="bg-background px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-muted/20">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {gallery.map((src, index) => (
              <div key={`${src}-${index}`} className="relative aspect-[21/9] w-full shrink-0">
                <Image
                  src={src}
                  alt={alt ? `${alt} photo ${index + 1}` : `Event image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {gallery.length > 1 ? (
            <>
              <CarouselArrow
                direction="left"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="left-4"
              />
              <CarouselArrow
                direction="right"
                onClick={handleNext}
                disabled={activeIndex === gallery.length - 1}
                className="right-4"
              />
              <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
                {gallery.map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-2 w-2 rounded-full bg-white/50 transition-all duration-300',
                      index === activeIndex && 'w-6 bg-white'
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
  className,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  disabled: boolean
  className?: string
}) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous image' : 'Next image'}
      className={cn(
        'text-white/90 hover:text-white absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 backdrop-blur transition disabled:opacity-40',
        className
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}
