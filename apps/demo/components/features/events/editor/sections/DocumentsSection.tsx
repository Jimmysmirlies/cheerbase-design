'use client'

import { useState, useCallback } from 'react'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { Textarea } from '@workspace/ui/shadcn/textarea'
import { Button } from '@workspace/ui/shadcn/button'
import { XIcon, PlusIcon, FileIcon, UploadIcon } from 'lucide-react'
import type { Event } from '@/types/events'

type Document = {
  name: string
  description: string
  href: string
}

type DocumentsSectionProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
}

// Store documents in the documents field
function getDocuments(eventData: Partial<Event>): Document[] {
  return eventData.documents || []
}

function setDocuments(eventData: Partial<Event>, documents: Document[]): Partial<Event> {
  return { ...eventData, documents }
}

export function DocumentsSection({ eventData, onUpdate }: DocumentsSectionProps) {
  const documents = getDocuments(eventData)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const newDocs: Document[] = []
    Array.from(files).forEach((file) => {
      // For demo: create object URL (in real app, upload to server)
      const url = URL.createObjectURL(file)
      newDocs.push({
        name: file.name,
        description: '',
        href: url,
      })
    })

    if (newDocs.length > 0) {
      const updated = setDocuments(eventData, [...documents, ...newDocs])
      onUpdate(updated)
    }
  }, [eventData, documents, onUpdate])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const updateDocument = useCallback((index: number, updates: Partial<Document>) => {
    const updated = documents.map((doc, i) => 
      i === index ? { ...doc, ...updates } : doc
    )
    const eventUpdated = setDocuments(eventData, updated)
    onUpdate(eventUpdated)
  }, [eventData, documents, onUpdate])

  const removeDocument = useCallback((index: number) => {
    const updated = documents.filter((_, i) => i !== index)
    const eventUpdated = setDocuments(eventData, updated)
    onUpdate(eventUpdated)
  }, [eventData, documents, onUpdate])

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label>Documents</Label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          `}
        >
          <UploadIcon className="mx-auto size-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop documents here, or click to select
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.multiple = true
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement
                handleFileSelect(target.files)
              }
              input.click()
            }}
          >
            Select Documents
          </Button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="size-5 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={doc.name}
                        onChange={(e) => updateDocument(index, { name: e.target.value })}
                        placeholder="Document title"
                        className="font-semibold"
                      />
                      <Textarea
                        value={doc.description}
                        onChange={(e) => updateDocument(index, { description: e.target.value })}
                        placeholder="Document subtitle/description"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  className="ml-4"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <FileIcon className="mx-auto size-12 mb-2 opacity-50" />
          <p className="text-sm">No documents added yet</p>
        </div>
      )}
    </div>
  )
}

