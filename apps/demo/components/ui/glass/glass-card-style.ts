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
    position: '7% 10%',
    color: { type: 'hsla', value: 'hsla(277,54%,49%,' },
    defaultAlpha: 0.0,
    hoverAlpha: 0.05,
  },
  {
    position: '98% 21%',
    color: { type: 'hsla', value: 'hsla(278,62%,56%,' },
    defaultAlpha: 0.0,
    hoverAlpha: 0.0,
  },
  {
    position: '81% 90%',
    color: { type: 'hsla', value: 'hsla(282,68%,66%,' },
    defaultAlpha: 0.0,
    hoverAlpha: 0.05,
  },
  {
    position: '88% 11%',
    color: { type: 'hsla', value: 'hsla(281,75%,60%,' },
    defaultAlpha: 0.0,
    hoverAlpha: 0.12,
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
    backgroundColor: 'hsla(299,0%,100%,1)',
    backgroundImage: activeBackground,
    backdropFilter: 'blur(24px)',
    boxShadow: showShadow ? bevelShadow : undefined,
    transition: 'background-image 0.4s ease-in-out',
  }
}
