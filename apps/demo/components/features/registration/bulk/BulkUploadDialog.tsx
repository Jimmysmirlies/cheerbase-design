"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import { Button } from "@workspace/ui/shadcn/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/shadcn/dialog"
import { Input } from "@workspace/ui/shadcn/input"
import { Label } from "@workspace/ui/shadcn/label"

import type { DivisionPricing } from "@/types/events"
import type { RegistrationEntry, RegistrationMember, TeamOption } from "../flow/types"
import { parseCsvText, guessMapping, groupRowsByTeam } from "@/utils/bulk-upload"
import { PricingBreakdownPanel } from "@/components/ui/cards/PricingBreakdownCard"

type BulkUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisionPricing: DivisionPricing[]
  teamOptions: TeamOption[]
  onImport: (entries: RegistrationEntry[]) => void
}

type Mapping = {
  teamName: string
  division: string
  name: string
  role: string
  dob?: string
  email?: string
  phone?: string
}

export function BulkUploadDialog({ open, onOpenChange, divisionPricing, teamOptions, onImport }: BulkUploadDialogProps) {
  const [step, setStep] = useState<"upload" | "map" | "preview" | "confirm">("upload")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<Mapping | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleReset = useCallback(() => {
    setStep("upload")
    setHeaders([])
    setRows([])
    setMapping(null)
    setError(null)
  }, [])

  const onClose = useCallback(
    (next: boolean) => {
      onOpenChange(next)
      if (!next) handleReset()
    },
    [onOpenChange, handleReset]
  )

  const handleFile = useCallback(async (file?: File) => {
    try {
      setError(null)
      if (!file) return
      const ext = file.name.split(".").pop()?.toLowerCase()
      if (ext !== "csv") {
        setError("Only CSV is supported in this demo. Please export your Excel file as CSV.")
        return
      }
      const text = await file.text()
      const { headers: h, rows: r } = parseCsvText(text)
      if (!h.length || !r.length) {
        setError("No data detected in the file.")
        return
      }
      setHeaders(h)
      setRows(r)
      const guessed = guessMapping(h)
      setMapping(guessed as Mapping)
      setStep("map")
    } catch {
      setError("Failed to read file. Please try again.")
    }
  }, [])

  const onBrowse = useCallback(() => fileInputRef.current?.click(), [])

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
    const file = event.dataTransfer?.files?.[0]
    if (!file) return
    void handleFile(file)
  }, [handleFile])

  const groups = useMemo(() => {
    if (!mapping) return []
    return groupRowsByTeam(rows, mapping)
  }, [rows, mapping])

  const entriesByDivision = useMemo(() => {
    const byDiv: Record<string, RegistrationEntry[]> = {}
    groups.forEach(group => {
      const teamName = group.teamName
      const division = group.division
      const existing = teamOptions.find(t => t.name.toLowerCase() === teamName.toLowerCase())
      const members: RegistrationMember[] = group.members.map(m => ({
        name: m.name,
        type: m.role || "Athlete",
        dob: m.dob || undefined,
        email: m.email || undefined,
        phone: m.phone || undefined,
      }))
      const entry: RegistrationEntry = existing
        ? {
            id: `${division}:${existing.id}`,
            division,
            mode: "existing",
            teamId: existing.id,
            teamName: existing.name,
            teamSize: members.length,
            members,
          }
        : {
            id: `${division}:${teamName}`,
            division,
            mode: "upload",
            teamName,
            teamSize: members.length,
            members,
          }
      const list = byDiv[division] ?? []
      list.push(entry)
      byDiv[division] = list
    })
    return byDiv
  }, [groups, teamOptions])

  const handleConfirm = useCallback(() => {
    const all: RegistrationEntry[] = Object.values(entriesByDivision).flat()
    onImport(all)
    onClose(false)
  }, [entriesByDivision, onImport, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl gap-0 rounded-2xl p-0">
        <DialogHeader className="px-6 pb-4 pt-6">
          <DialogTitle>Bulk upload teams (CSV)</DialogTitle>
          <DialogDescription>
            Upload a single CSV with all teams and members. You can also still add teams individually or link existing teams.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-6 px-6 pb-6">
          {step === "upload" ? (
            <section className="space-y-3">
              <div
                className={
                  "border-dashed border-2 rounded-2xl p-8 text-center transition-colors " +
                  (isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/30")
                }
                onDragOver={onDragOver}
                onDragEnter={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onClick={onBrowse}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onBrowse()
                  }
                }}
              >
                <p className="text-sm font-medium">Drop your CSV here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
                <div className="sr-only">
                  <Label htmlFor="bulk-upload-input">Choose CSV file</Label>
                </div>
                <Input
                  id="bulk-upload-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={event => handleFile(event.target.files?.[0] ?? undefined)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Export your Excel file as CSV. Template: <a className="underline" href="/templates/registration-template.csv">registration-template.csv</a>
              </p>
              {error ? <p className="text-xs text-amber-600">{error}</p> : null}
            </section>
          ) : null}

          {step === "map" && mapping ? (
            <section className="space-y-4">
              <p className="text-sm text-muted-foreground">Map your columns to required fields.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { key: "teamName", label: "Team Name", required: true },
                  { key: "division", label: "Division", required: true },
                  { key: "name", label: "Member Name", required: true },
                  { key: "role", label: "Role", required: true },
                  { key: "dob", label: "DOB (YYYY-MM-DD)", required: false },
                  { key: "email", label: "Email", required: false },
                  { key: "phone", label: "Phone", required: false },
                ].map(field => (
                  <div key={field.key} className="grid gap-1">
                    <Label>
                      {field.label} {field.required ? <span className="text-red-600">*</span> : null}
                    </Label>
                    <select
                      className="border-input bg-background text-foreground inline-flex h-10 w-full items-center rounded-md border px-3 text-sm"
                      value={(mapping as Record<string, string | undefined>)[field.key] ?? ""}
                      onChange={evt => setMapping(prev => ({ ...(prev as Mapping), [field.key]: evt.target.value }))}
                    >
                      <option value="">— Select column —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep("upload")}>Back</Button>
                <Button
                  type="button"
                  onClick={() => setStep("preview")}
                  disabled={!mapping.teamName || !mapping.division || !mapping.name || !mapping.role}
                >
                  Continue
                </Button>
              </div>
            </section>
          ) : null}

          {step === "preview" && groups.length ? (
            <section className="space-y-4">
              <p className="text-sm text-muted-foreground">Preview grouped teams. Existing teams are auto-linked by name.</p>
              <div className="max-h-80 overflow-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Team</th>
                      <th className="px-3 py-2 text-left font-medium">Division</th>
                      <th className="px-3 py-2 text-left font-medium">Participants</th>
                      <th className="px-3 py-2 text-left font-medium">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(g => {
                      const match = teamOptions.find(t => t.name.toLowerCase() === g.teamName.toLowerCase())
                      return (
                        <tr key={`${g.teamName}:${g.division}`} className="border-t">
                          <td className="px-3 py-2">{g.teamName}</td>
                          <td className="px-3 py-2">{g.division}</td>
                          <td className="px-3 py-2">{g.members.length}</td>
                          <td className="px-3 py-2">{match ? `Linked (${match.name})` : "New team"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep("map")}>Back</Button>
                <Button type="button" onClick={() => setStep("confirm")}>Continue</Button>
              </div>
            </section>
          ) : null}

          {step === "confirm" ? (
            <section className="space-y-4">
              <p className="text-sm text-muted-foreground">Pricing preview by division</p>
              <div className="rounded-md border p-3">
                <PricingBreakdownPanel entriesByDivision={entriesByDivision} divisionPricing={divisionPricing} />
              </div>
            </section>
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-between border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => onClose(false)}>
            Cancel
          </Button>
          {step === "confirm" ? (
            <Button type="button" onClick={handleConfirm} disabled={!groups.length}>
              Import teams
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
