import type { CSSProperties } from 'react'

type GradientColor = { type: 'hsla'; value: string } | { type: 'oklch-token'; token: string }

type GlassGradientStop = {
  position: string
  color: GradientColor
  defaultAlpha: number
  hoverAlpha: number
}

const GLASS_GRADIENT_STOPS: GlassGradientStop[] = [
  {
    position: '0% 38%',
    color: { type: 'hsla', value: 'hsla(0,0%,100%,' },
    defaultAlpha: 0.2,
    hoverAlpha: 0.35,
  },
  {
    position: '0% 0%',
    color: { type: 'oklch-token', token: '--glass-peach' },
    defaultAlpha: 0.12,
    hoverAlpha: 0.22,
  },
  {
    position: '30% 65%',
    color: { type: 'oklch-token', token: '--glass-light-yellow' },
    defaultAlpha: 0.18,
    hoverAlpha: 0.22,
  },
  {
    position: '50% 50%',
    color: { type: 'oklch-token', token: '--glass-light-green' },
    defaultAlpha: 0.3,
    hoverAlpha: 0.4,
  },
  {
    position: '100% 100%',
    color: { type: 'oklch-token', token: '--glass-light-blue' },
    defaultAlpha: 0.15,
    hoverAlpha: 0.22,
  },
]

function formatColor(color: GradientColor, alpha: number) {
  if (color.type === 'hsla') {
    return `${color.value}${alpha})`
  }

  return `oklch(var(${color.token}) / ${alpha})`
}

function buildGlassGradient(hovered: boolean) {
  return GLASS_GRADIENT_STOPS.map(({ position, color, defaultAlpha, hoverAlpha }) => {
    const alpha = hovered ? hoverAlpha : defaultAlpha
    const firstStop = `${formatColor(color, alpha)} 0px`
    return `radial-gradient(at ${position}, ${firstStop}, transparent 50%)`
  }).join(',\n')
}

export type GlassCardStyleOptions = {
  hovered?: boolean
  showShadow?: boolean
  emphasis?: 'default' | 'active'
}

export function getGlassCardStyle({
  hovered = false,
  showShadow = true,
  emphasis = 'default',
}: GlassCardStyleOptions = {}): CSSProperties {
  const bevelShadow =
    'inset 0 1px 2px 0 hsla(0,0%,100%,0.45), inset 0 -1px 3px 0 hsla(0,0%,100%,0.18)'

  const activeBackground =
    emphasis === 'active'
      ? buildGlassGradient(true)
      : buildGlassGradient(hovered)

  return {
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'hsla(300,0%,100%,0.35)',
    backgroundImage: activeBackground,
    backdropFilter: 'blur(24px)',
    boxShadow: showShadow ? bevelShadow : undefined,
    transition: 'background-image 0.4s ease-in-out',
  }
}
