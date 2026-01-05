'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { brandGradients, noiseTexture, type BrandGradient } from '@/lib/gradients'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type BreadcrumbItem = {
  label: string
  href?: string
}

type CountdownConfig = {
  targetDate: string | Date
  label?: string // Default: "Registration Closes"
}

type MetadataItem = {
  label: string
  value: ReactNode
}

type PageHeaderProps = {
  // Core
  title: string
  gradient?: BrandGradient

  // Slots - clear naming for where content appears
  /** Content in top-right corner (e.g., layout toggle, back link) */
  topRightAction?: ReactNode
  /** Action button(s) inline with title (e.g., "Edit Event" button) */
  titleAction?: ReactNode
  /** Badge displayed next to title (e.g., "Beta", "Draft") */
  titleBadge?: ReactNode

  // Eyebrow area (above title) - use ONE of these
  /** Formatted date displayed above title */
  dateLabel?: string | Date
  /** Breadcrumb navigation above title */
  breadcrumbs?: BreadcrumbItem[]
  /** Custom eyebrow content (use when dateLabel/breadcrumbs don't fit) */
  eyebrow?: ReactNode

  // Optional sections
  subtitle?: string
  /** Key-value metadata displayed below title */
  metadata?: MetadataItem[]
  metadataColumns?: number

  // Countdown timer
  countdown?: CountdownConfig

  // Visual options
  hideBorder?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SECOND_IN_MS = 1000
const MINUTE_IN_MS = 60 * SECOND_IN_MS
const HOUR_IN_MS = 60 * MINUTE_IN_MS
const DAY_IN_MS = 24 * HOUR_IN_MS

type CountdownDisplay =
  | {
      state: 'future'
      segments: { days: number; hours: number; seconds: number }
    }
  | { state: 'past' }

function getCountdown(targetDate?: string | Date): CountdownDisplay | null {
  if (!targetDate) return null
  const target = new Date(targetDate)
  if (Number.isNaN(target.getTime())) return null

  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  if (diffMs <= 0) return { state: 'past' }

  const days = Math.floor(diffMs / DAY_IN_MS)
  const remainingAfterDays = diffMs % DAY_IN_MS
  const hours = Math.floor(remainingAfterDays / HOUR_IN_MS)
  const remainingAfterHours = remainingAfterDays % HOUR_IN_MS
  const seconds = Math.floor((remainingAfterHours % MINUTE_IN_MS) / SECOND_IN_MS)

  return { state: 'future', segments: { days, hours, seconds } }
}

function formatDateLabel(date: string | Date): string {
  const dateObj = new Date(date)
  if (Number.isNaN(dateObj.getTime())) return ''
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function createGradientStyle(variant: BrandGradient = 'primary'): CSSProperties {
  const gradient = brandGradients[variant]
  return {
    backgroundColor: 'hsla(0,0%,100%,1)',
    backgroundImage: [noiseTexture, gradient.css].join(','),
    backgroundRepeat: 'repeat, no-repeat',
    backgroundSize: 'auto, auto',
    backgroundBlendMode: 'soft-light, normal',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  gradient = 'teal',
  topRightAction,
  titleAction,
  titleBadge,
  dateLabel,
  breadcrumbs,
  eyebrow,
  subtitle,
  metadata,
  metadataColumns = 3,
  countdown,
  hideBorder,
}: PageHeaderProps) {
  // Countdown state (client-only to avoid hydration mismatch)
  const [countdownDisplay, setCountdownDisplay] = useState<CountdownDisplay | null>(null)

  useEffect(() => {
    if (!countdown?.targetDate) return

    setCountdownDisplay(getCountdown(countdown.targetDate))
    const interval = window.setInterval(() => {
      setCountdownDisplay(getCountdown(countdown.targetDate))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [countdown?.targetDate])

  // Determine eyebrow content (priority: eyebrow > dateLabel > breadcrumbs)
  const eyebrowContent = eyebrow ? (
    eyebrow
  ) : dateLabel ? (
    <div>{formatDateLabel(dateLabel)}</div>
  ) : breadcrumbs?.length ? (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Breadcrumb">
      {breadcrumbs.map((item, idx) => (
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
          {idx < breadcrumbs.length - 1 && <span className="text-white/60">/</span>}
        </div>
      ))}
    </nav>
  ) : null

  // Countdown segments
  const countdownSegments =
    countdownDisplay?.state === 'future'
      ? [
          { label: 'Days', value: countdownDisplay.segments.days },
          { label: 'Hours', value: countdownDisplay.segments.hours },
          { label: 'Secs', value: countdownDisplay.segments.seconds },
        ]
      : null

  const showCountdown = countdown && countdownDisplay
  const countdownLabel = countdown?.label ?? 'Registration Closes'

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden backdrop-blur-sm',
        !hideBorder && 'border-b border-border/70'
      )}
      style={createGradientStyle(gradient)}
    >
      <header className="flex min-h-[240px] w-full max-w-full flex-col justify-between px-4 pb-8 pt-4 lg:mx-auto lg:max-w-7xl lg:px-8">
        {/* Top row: action aligned right */}
        <div className="flex justify-end">{topRightAction ?? <div />}</div>

        {/* Main content area */}
        <div className="flex flex-col justify-end gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Left: eyebrow + title */}
            <div className="flex flex-1 flex-col gap-2">
              {eyebrowContent && (
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/80">
                  {eyebrowContent}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="heading-2 text-white">{title}</h1>
                  {titleBadge}
                </div>
                {titleAction}
              </div>
            </div>

            {/* Right: countdown */}
            {showCountdown && (
              <div className="flex w-full flex-col items-end gap-4 sm:flex-row sm:items-end sm:justify-end sm:gap-6 lg:w-auto lg:flex-col">
                {countdownDisplay.state === 'past' ? (
                  <div className="text-right text-sm font-semibold uppercase tracking-[0.2em] text-white">
                    Event Passed
                  </div>
                ) : countdownSegments ? (
                  <div className="flex flex-col items-end gap-2 text-white">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      {countdownLabel}
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
            )}
          </div>

          {/* Subtitle */}
          {subtitle && <p className="text-base text-white/85">{subtitle}</p>}

          {/* Divider before metadata */}
          {(subtitle || metadata?.length) && <div className="h-px w-full bg-white/30" />}

          {/* Metadata grid */}
          {metadata?.length ? (
            <div className={`grid gap-8 text-sm text-white sm:grid-cols-${metadataColumns}`}>
              {metadata.map((item, idx) => (
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
