'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyStateButton } from '@/components/ui/buttons/EmptyStateButton'
import { ImageIcon, UploadIcon, CalendarIcon } from 'lucide-react'
import { toast } from '@workspace/ui/shadcn/sonner'

export default function EmptyStateButtonComponentPage() {
  const [clickCount, setClickCount] = useState(0)

  const handleClick = () => {
    setClickCount((prev) => prev + 1)
    toast.success(`Button clicked ${clickCount + 1} time(s)`)
  }

  return (
    <>
      <PageHeader
        title="Empty State Button"
        subtitle="Dashed-border button for empty states that prompts users to add content. Use when a section has no content yet and the user can take action to add it."
        breadcrumbs={[
          { label: 'Brand Guidelines', href: '/style-guide' },
          { label: 'Components', href: '/style-guide/components' },
        ]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <div className="space-y-12">
          {/* Examples section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-semibold">Examples</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Default (with description)
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <EmptyStateButton
                    title="Add event description"
                    description="Provide a compelling overview of your event"
                    onClick={handleClick}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Title only
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <EmptyStateButton title="Add new item" onClick={handleClick} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Custom icon
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <EmptyStateButton
                      title="Upload images"
                      description="Add photos to your gallery"
                      icon={<ImageIcon className="size-4 text-muted-foreground group-hover:text-primary" />}
                      onClick={handleClick}
                    />
                    <EmptyStateButton
                      title="Upload documents"
                      description="Add files and resources"
                      icon={<UploadIcon className="size-4 text-muted-foreground group-hover:text-primary" />}
                      onClick={handleClick}
                    />
                    <EmptyStateButton
                      title="Set event date"
                      description="Choose when your event takes place"
                      icon={<CalendarIcon className="size-4 text-muted-foreground group-hover:text-primary" />}
                      onClick={handleClick}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Disabled state
                </p>
                <div className="rounded-3xl border border-border bg-card/60 p-6">
                  <EmptyStateButton
                    title="Add team members"
                    description="You need permission to add members"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Props section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Props</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Prop</th>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Default</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">title</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Primary text displayed in the button (required)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">description</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Secondary descriptive text
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">onClick</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {'() => void'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">Click handler</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">icon</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">ReactNode</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">PlusIcon</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Custom icon to display in the circular badge
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">className</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">string</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Additional className for the outer button
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">disabled</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">boolean</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">false</td>
                    <td className="px-4 py-3 text-muted-foreground">Disabled state</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Design Tokens section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Design Tokens</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>1px dashed border using border-border color</li>
                <li>Rounded corners (rounded-md)</li>
                <li>Primary color accent on hover (border and background)</li>
                <li>Circular icon badge with matching dashed border</li>
                <li>Generous padding (p-8) for visual prominence</li>
              </ul>
            </div>
          </div>

          {/* Usage Guidelines section */}
          <div className="flex flex-col gap-4 px-1">
            <div className="flex flex-col gap-4">
              <div className="h-px w-full bg-border" />
              <p className="text-lg font-semibold">Usage Guidelines</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              <ul className="list-inside list-disc space-y-1">
                <li>Use for empty states where user action can add content</li>
                <li>Keep titles action-oriented (e.g., &quot;Add&quot;, &quot;Upload&quot;, &quot;Set&quot;)</li>
                <li>Descriptions should explain the benefit or purpose</li>
                <li>Use custom icons when they help clarify the action type</li>
                <li>Place in the content area where the items would normally appear</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
