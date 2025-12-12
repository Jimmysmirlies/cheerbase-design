'use client'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'registration-timeline', label: 'Registration Timeline' },
  { id: 'date-location', label: 'Date & Location' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'organizer', label: 'Organizer' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'documents', label: 'Documents' },
  { id: 'results', label: 'Results' },
] as const

const NAV_HEIGHT = 88

type EventTableOfContentsProps = {
  showLabel?: boolean
  showDivider?: boolean
}

export function EventTableOfContents({ showLabel = true, showDivider = true }: EventTableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return

    const top = section.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <nav className={`flex flex-col gap-1 ${showDivider ? 'border-t border-border/50 pt-4' : ''}`}>
      {showLabel && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 pt-1">
          On this page
        </p>
      )}
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id)}
          className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
