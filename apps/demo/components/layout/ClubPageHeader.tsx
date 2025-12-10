'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import { brandGradients, noiseTexture, type BrandGradient } from '@/lib/gradients'

type BreadcrumbItem = {
  label: string
  href?: string
}

type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  hideSubtitle?: boolean
  hideTitle?: boolean
  eventStartDate?: string | Date
  breadcrumbs?: ReactNode
  breadcrumbItems?: BreadcrumbItem[]
  metadataItems?: { label: string; value: ReactNode }[]
  metadataColumns?: number
  gradientVariant?: GradientVariant
}

const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

type CountdownDisplay =
  | {
      state: 'future'
      segments: {
        days: number
        hours: number
        seconds: number
      }
    }
  | { state: 'past' }

function getEventCountdown(eventStartDate?: string | Date): CountdownDisplay | null {
  if (!eventStartDate) return null
  const start = new Date(eventStartDate)
  if (Number.isNaN(start.getTime())) return null

  const now = new Date()
  const diffMs = start.getTime() - now.getTime()
  if (diffMs <= 0) return { state: 'past' }

  const days = Math.floor(diffMs / DAY_IN_MS)
  const remainingAfterDays = diffMs % DAY_IN_MS
  const hours = Math.floor(remainingAfterDays / HOUR_IN_MS)
  const remainingAfterHours = remainingAfterDays % HOUR_IN_MS
  const seconds = Math.floor((remainingAfterHours % MINUTE_IN_MS) / SECOND_IN_MS)

  return {
    state: 'future',
    segments: {
      days,
      hours,
      seconds,
    },
  }
}

export type GradientVariant = BrandGradient

function createGradientStyle(variant: GradientVariant = 'primary'): CSSProperties {
  const gradient = brandGradients[variant]
  return {
    backgroundColor: 'hsla(0,0%,100%,1)',
    backgroundImage: [noiseTexture, gradient.css].join(','),
    backgroundRepeat: 'repeat, no-repeat',
    backgroundSize: 'auto, auto',
    backgroundBlendMode: 'soft-light, normal',
  }
}

export function PageHeader({
  title,
  subtitle,
  action,
  hideSubtitle,
  hideTitle,
  eventStartDate,
  breadcrumbs,
  breadcrumbItems,
  metadataItems,
  metadataColumns = 3,
  gradientVariant = 'primary',
}: PageHeaderProps) {
  // Initialize as null to avoid hydration mismatch (Date.now() differs between server and client)
  const [eventCountdown, setEventCountdown] = useState<CountdownDisplay | null>(null)

  useEffect(() => {
    // Calculate countdown only on client to avoid hydration issues
    setEventCountdown(getEventCountdown(eventStartDate))
    if (!eventStartDate) return

    const interval = window.setInterval(() => {
      setEventCountdown(getEventCountdown(eventStartDate))
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [eventStartDate])

  const countdownSegments =
    eventCountdown && eventCountdown.state === 'future'
      ? [
          { label: 'Days', value: eventCountdown.segments.days },
          { label: 'Hours', value: eventCountdown.segments.hours },
          { label: 'Secs', value: eventCountdown.segments.seconds },
        ]
      : null
  const hasBreadcrumbItems = (breadcrumbItems?.length ?? 0) > 0

  return (
    <div
      className="relative w-full overflow-hidden border-b border-border/70 backdrop-blur-sm"
      style={createGradientStyle(gradientVariant)}
    >
      <header className="flex min-h-[240px] w-full max-w-full flex-col justify-between px-4 pb-8 pt-4 lg:mx-auto lg:max-w-7xl lg:px-8">
        {/* Top row: action aligned right */}
        <div className="flex justify-end">{action ?? <div />}</div>
        <div className="flex flex-col justify-end gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              {hasBreadcrumbItems || breadcrumbs ? (
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">
                  {hasBreadcrumbItems ? (
                    <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
                      {breadcrumbItems?.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="flex items-center gap-2">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="text-white/90 underline-offset-4 hover:text-white hover:underline"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span>{item.label}</span>
                          )}
                          {idx < (breadcrumbItems?.length ?? 0) - 1 ? (
                            <span className="text-white/60">/</span>
                          ) : null}
                        </div>
                      ))}
                    </nav>
                  ) : (
                    breadcrumbs
                  )}
                </div>
              ) : null}
              {!hideTitle ? <h1 className="heading-2 text-white">{title}</h1> : null}
            </div>
            {eventCountdown ? (
              <div className="flex w-full flex-col items-end gap-4 sm:flex-row sm:items-end sm:justify-end sm:gap-6 lg:w-auto lg:flex-col">
                {eventCountdown.state === 'past' ? (
                  <div className="text-right text-sm font-semibold uppercase tracking-[0.2em] text-white">
                    Event Passed
                  </div>
                ) : countdownSegments ? (
                  <div className="flex flex-col items-end gap-2 text-white">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      Registration Closes
                    </span>
                    <div className="grid grid-flow-col items-start gap-4">
                      {countdownSegments.map((segment) => (
                        <div key={segment.label} className="flex flex-col items-center">
                          <span className="heading-2 leading-none">
                            {segment.value.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/60">
                            {segment.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {subtitle && !hideSubtitle ? <p className="text-base text-white/85">{subtitle}</p> : null}
          {(subtitle && !hideSubtitle) || metadataItems?.length ? (
            <div className="h-px w-full bg-white/30" />
          ) : null}
          {metadataItems?.length ? (
            <div className={`grid gap-8 text-sm text-white sm:grid-cols-${metadataColumns}`}>
              {metadataItems.map((item, idx) => (
                <div key={`${item.label}-${idx}`} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-white/80">{item.label}</span>
                    <span className="text-right font-semibold">{item.value}</span>
                  </div>
                  <div className="h-px w-full bg-white/30" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </header>
    </div>
  )
}
