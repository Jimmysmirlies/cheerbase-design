'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import Link from 'next/link'

import { CheckCircle2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import { FALLBACK_EVENT_IMAGE } from '@/data/events/fallbacks'
import { cn } from '@workspace/ui/lib/utils'

type HeroAction = {
  label: string
  href: string
  variant?: 'primary' | 'secondary'
  icon?: ReactNode
}

type HeroFeaturedEvent = {
  image: string
  type: string
  title: string
  organizer: string
  date: string
  location: string
  teams: string
  fee: string
  href?: string
}

export type HeroSlide = {
  id: string
  eyebrow?: string
  headline: string
  description?: string
  highlights?: string[]
  image?: string
  imageAlt?: string
  primaryAction: HeroAction
  secondaryActions?: HeroAction[]
  fullImage?: boolean
  layout?: 'default' | 'event-card'
  featuredEvent?: HeroFeaturedEvent
  organizer?: string
}

type SharedHeroProps = {
  children?: ReactNode
}

type SingleHeroProps = SharedHeroProps & {
  eyebrow?: string
  headline: string
  description?: string
  highlights?: string[]
  image?: string
  imageAlt?: string
  primaryAction: HeroAction
  secondaryActions?: HeroAction[]
}

type CarouselHeroProps = SharedHeroProps & {
  slides: HeroSlide[]
}

export type HeroProps = SingleHeroProps | CarouselHeroProps

export function Hero(props: HeroProps) {
  if ('slides' in props) {
    if (!props.slides.length) return null
    return <HeroCarousel slides={props.slides} />
  }

  return <HeroSingle {...props} />
}

function HeroSingle(props: SingleHeroProps) {
  const { eyebrow, headline, description, highlights = [], image, imageAlt, primaryAction, secondaryActions = [] } =
    props

  return (
    /* Hero Single Variant: "Story Panel" */
    <section className="bg-background px-6 py-16 sm:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="space-y-8">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
              {eyebrow}
            </span>
          ) : null}
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            {description ? <p className="text-base text-muted-foreground sm:text-lg">{description}</p> : null}
          </div>

          {highlights.length > 0 ? (
            <ul className="space-y-3 text-sm text-muted-foreground">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2Icon className="text-primary mt-1 size-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <HeroLink action={primaryAction} />
            {secondaryActions.map((action) => (
              <HeroLink key={action.label} action={action} />
            ))}
          </div>
        </div>

        {image ? (
          <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-muted/40">
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
              role={imageAlt ? 'img' : undefined}
              aria-label={imageAlt}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const isFullImageCarousel = slides.length > 0 && slides.every((slide) => slide.fullImage)
  if (isFullImageCarousel) {
    return <HeroCarouselFullBleed slides={slides} />
  }
  return <HeroCarouselDefault slides={slides} />
}

function HeroCarouselFullBleed({ slides }: { slides: HeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const handlePrev = () => setActiveIndex((prev) => (prev === 0 ? prev : prev - 1))
  const handleNext = () => setActiveIndex((prev) => (prev === slides.length - 1 ? prev : prev + 1))

  return (
    /* Hero Carousel Variant: "Full-Bleed Storyboard" */
    <section className="bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl shadow-lg overflow-hidden rounded-[1rem]">
        <div className="relative min-h-[400px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-in-out',
                index === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
              )}
            >
              <HeroSlidePanel slide={slide} />
            </div>
          ))}

          {slides.length > 1 ? (
            <>
              <CarouselOverlayArrow
                direction="left"
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="left-6"
              />
              <CarouselOverlayArrow
                direction="right"
                onClick={handleNext}
                disabled={activeIndex === slides.length - 1}
                className="right-6"
              />
              <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.id}-indicator`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className="focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        'inline-block h-2 rounded-full bg-white/40 transition-all duration-300',
                        index === activeIndex ? 'w-8 bg-white' : 'w-2'
                      )}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function HeroCarouselDefault({ slides }: { slides: HeroSlide[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slideElements = Array.from(container.querySelectorAll<HTMLElement>('[data-hero-slide]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.slideIndex ?? '0')
            setActiveIndex(idx)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    slideElements.forEach((slide) => observer.observe(slide))
    return () => observer.disconnect()
  }, [slides.length])

  const scrollTo = (index: number) => {
    const container = containerRef.current
    if (!container) return
    const target = container.querySelectorAll<HTMLElement>('[data-hero-slide]')[index]
    if (!target) return

    container.scrollTo({ left: target.offsetLeft - container.offsetLeft, behavior: 'smooth' })
  }

  const handlePrev = () => scrollTo(Math.max(0, activeIndex - 1))
  const handleNext = () => scrollTo(Math.min(slides.length - 1, activeIndex + 1))

  return (
    /* Hero Carousel Variant: "Standard Slides" */
    <section className="bg-background px-12 py-12 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div
          ref={containerRef}
          className="flex snap-x snap-mandatory gap-0 overflow-x-auto px-0 pb-12 pt-4 scroll-smooth [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              data-hero-slide
              data-slide-index={index}
              className="w-full shrink-0 snap-start"
            >
              <div className="mx-auto max-w-7xl px-6 transition-all duration-500 ease-out sm:px-8">
                <HeroSlidePanel slide={slide} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <CarouselButton onClick={handlePrev} disabled={activeIndex === 0} ariaLabel="Previous hero slide">
              <ChevronLeftIcon className="size-4" />
            </CarouselButton>
            <span className="text-sm text-muted-foreground">
              {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
            <CarouselButton onClick={handleNext} disabled={activeIndex === slides.length - 1} ariaLabel="Next hero slide">
              <ChevronRightIcon className="size-4" />
            </CarouselButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroSlidePanel({ slide }: { slide: HeroSlide }) {
  if (slide.layout === 'event-card' && slide.featuredEvent) {
    return <HeroEventSlide slide={slide} />
  }

  if (slide.fullImage) {
    return (
      <div className="relative h-full min-h-[520px] w-full">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide.image || FALLBACK_EVENT_IMAGE})` }}
          role={slide.imageAlt ? 'img' : undefined}
          aria-label={slide.imageAlt}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-8 text-white sm:p-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{slide.headline}</h2>
            {slide.organizer ? (
              <p className="text-lg font-medium text-white/80">{slide.organizer}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <HeroLink action={slide.primaryAction} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-8">
        {slide.eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            {slide.eyebrow}
          </span>
        ) : null}
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            {slide.headline}
          </h2>
          {slide.description ? (
            <p className="text-base text-muted-foreground sm:text-lg">{slide.description}</p>
          ) : null}
        </div>

        {slide.highlights?.length ? (
          <ul className="space-y-3 text-sm text-muted-foreground">
            {slide.highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2Icon className="text-primary mt-1 size-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <HeroLink action={slide.primaryAction} />
          {slide.secondaryActions?.map((action) => (
            <HeroLink key={action.label} action={action} />
          ))}
        </div>
      </div>

      {slide.image ? (
        <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-muted/40">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
            role={slide.imageAlt ? 'img' : undefined}
            aria-label={slide.imageAlt}
          />
        </div>
      ) : null}
    </div>
  )
}

function HeroEventSlide({ slide }: { slide: HeroSlide }) {
  const event = slide.featuredEvent!
  const mediaImage = event.image || FALLBACK_EVENT_IMAGE

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-6">
        {slide.eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            {slide.eyebrow}
          </span>
        ) : null}
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            {slide.headline ?? event.title}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {slide.description ?? `${event.location} · ${event.date}`}
          </p>
        </div>

        {slide.highlights?.length ? (
          <ul className="space-y-3 text-sm text-muted-foreground">
            {slide.highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2Icon className="text-primary mt-1 size-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <HeroLink action={slide.primaryAction} />
          {slide.secondaryActions?.map((action) => (
            <HeroLink key={action.label} action={action} />
          ))}
        </div>
      </div>

      {mediaImage ? (
        <div className="relative h-[420px] overflow-hidden rounded-[2.5rem] bg-muted/40">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${mediaImage})` }}
            role={slide.imageAlt ? 'img' : undefined}
            aria-label={slide.imageAlt ?? `${event.title} feature image`}
          />
        </div>
      ) : (
        <div className="relative flex h-[420px] items-center justify-center rounded-[2.5rem] border border-border/60 bg-muted/30">
          <span className="text-muted-foreground text-sm font-medium">Media coming soon</span>
        </div>
      )}
    </div>
  )
}

function CarouselOverlayArrow({
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
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
      className={cn(
        'text-white/90 hover:text-white absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 backdrop-blur transition disabled:opacity-40',
        className
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}

function CarouselButton({
  onClick,
  disabled,
  ariaLabel,
  children,
}: {
  onClick: () => void
  disabled: boolean
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="text-muted-foreground/80 hover:text-foreground flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-lg transition disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function HeroLink({ action }: { action: HeroAction }) {
  const variant = action.variant === 'secondary' ? 'outline' : 'default'
  return (
    <Button asChild variant={variant} size="lg">
      <Link href={action.href}>
        {action.label}
        {action.icon ? <span className="ml-2 inline-flex items-center">{action.icon}</span> : null}
      </Link>
    </Button>
  )
}
