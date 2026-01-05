'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { EventEditorV2 } from '@/components/features/events/editor/EventEditorV2'

export default function NewEventPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, status } = useAuth()

  useEffect(() => {
    if (status === 'loading') return
    if (!user || user.role !== 'organizer') {
      router.replace('/organizer/events')
    }
  }, [user, status, router])

  if (status === 'loading' || !user || user.role !== 'organizer') {
    return (
      <section className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </section>
    )
  }

  // Read initial event data from URL params
  const initialData = {
    name: searchParams.get('name') || '',
    type: (searchParams.get('type') as 'Championship' | 'Friendly Competition') || 'Championship',
    capacity: searchParams.get('capacity') ? parseInt(searchParams.get('capacity')!, 10) : 0,
  }

  return <EventEditorV2 mode="create" initialData={initialData} />
}
