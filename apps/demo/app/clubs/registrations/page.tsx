import { Button } from '@workspace/ui/shadcn/button'

import Link from 'next/link'

import RegistrationsSection from '@/components/blocks/club-dashboard/RegistrationsSection'
import { NavBar } from '@/components/blocks/layout/nav-bar'

export default function ClubRegistrationsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar showSearch={false} mode="clubs" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Club workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight">Registrations</h1>
            <p className="text-muted-foreground text-sm">
              Review every event submission, update rosters, and keep an eye on payment deadlines.
            </p>
          </div>
          <Button asChild type="button" variant="outline">
            <Link href="/events">Browse events</Link>
          </Button>
        </header>
        <RegistrationsSection />
      </div>
    </main>
  )
}
