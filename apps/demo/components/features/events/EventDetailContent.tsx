'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LayoutToggle } from '@/components/ui/controls/LayoutToggle'
import { EventDetailBody, type EventDetailBodyProps } from './EventDetailBody'

type EventDetailContentProps = Omit<EventDetailBodyProps, 'layout' | 'hideRegistration'>

export function EventDetailContent(props: EventDetailContentProps) {
  const [layout, setLayout] = useState<'A' | 'B'>('A')

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title={props.event.name}
        gradient={props.organizerGradient}
        dateLabel={props.event.date}
        topRightAction={
          <LayoutToggle
            variants={['A', 'B'] as const}
            value={layout}
            onChange={setLayout}
            showTutorial={false}
          />
        }
      />

      <EventDetailBody {...props} layout={layout} />
    </section>
  )
}

// Re-export types for convenience
export type { TimelinePhase, PricingRow, EventDocument } from './EventDetailBody'
