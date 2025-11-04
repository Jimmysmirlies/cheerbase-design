import { cn } from '@workspace/ui/lib/utils'

interface ColorSwatchProps {
  hex: string
  className?: string
}

export function ColorSwatch({ hex, className }: ColorSwatchProps) {
  return (
    <div className={cn('h-4 w-4 rounded-sm', className)} style={{ backgroundColor: `#${hex}` }} />
  )
}
