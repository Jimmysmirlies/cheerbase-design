import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { DatePicker } from '@workspace/ui/shadcn/date-picker'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'
import { Input } from '@workspace/ui/shadcn/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/shadcn/select'

import { Trash2Icon } from 'lucide-react'

import type { RegistrationMember } from './types'
import { DEFAULT_ROLE, ROLE_OPTIONS } from './types'

type EditableRosterRow = {
  name: string
  dob: string
  email: string
  phone: string
  role: string
}

const DATA_COLUMN_KEYS = ['name', 'dob', 'email', 'phone', 'role'] as const
type DataColumnKey = (typeof DATA_COLUMN_KEYS)[number]

function parseDobValue(value?: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(part => Number(part))
  if (!year || !month || !day) return undefined
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return undefined
  return parsed
}

function formatDobValue(date?: Date): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getOrdinalSuffix(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function getDobDisplayLabel(value?: string): string {
  const date = parseDobValue(value)
  if (!date) return ''
  const month = date.toLocaleString('en-US', { month: 'long' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`
}

const COLUMN_BASE_MIN_CH: Record<DataColumnKey, number> = {
  name: 12,
  dob: 18,
  email: 24,
  phone: 16,
  role: 10,
}

function getColumnValueLength(row: EditableRosterRow, key: DataColumnKey): number {
  const value = row[key]
  if (!value) return 0
  if (key === 'dob') {
    return getDobDisplayLabel(value).length || value.length
  }
  return value.length
}

function calculateColumnMinWidths(rows: EditableRosterRow[]): Record<DataColumnKey, number> {
  return DATA_COLUMN_KEYS.reduce((acc, key) => {
    const maxLength = Math.max(
      COLUMN_BASE_MIN_CH[key],
      ...rows.map(row => getColumnValueLength(row, key))
    )
    acc[key] = maxLength + 4
    return acc
  }, {} as Record<DataColumnKey, number>)
}

function buildEditableRows(members: RegistrationMember[]): EditableRosterRow[] {
  if (!members?.length) return []
  return members.map(member => ({
    name: member.name ?? '',
    dob: member.dob ?? '',
    email: member.email ?? '',
    phone: member.phone ?? '',
    role: member.type ?? DEFAULT_ROLE,
  }))
}

function createEmptyEditableRow(): EditableRosterRow {
  return {
    name: '',
    dob: '',
    email: '',
    phone: '',
    role: DEFAULT_ROLE,
  }
}

const DOB_YEAR_RANGE = 80
const ACTIONS_COLUMN_WIDTH = 56

export type RosterEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: RegistrationMember[]
  teamName: string
  onSave: (members: RegistrationMember[]) => void
  onDeleteTeam?: () => void
}

export function RosterEditorDialog({ open, onOpenChange, members, teamName, onSave, onDeleteTeam }: RosterEditorDialogProps) {
  const normalizedMembers = useMemo(() => buildEditableRows(members), [members])
  const initialRowsRef = useRef<EditableRosterRow[]>(normalizedMembers)
  const [rows, setRows] = useState<EditableRosterRow[]>(normalizedMembers)
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const earliestYear = currentYear - DOB_YEAR_RANGE
  const columnMinWidths = useMemo(() => calculateColumnMinWidths(rows), [rows])

  useEffect(() => {
    if (open) {
      initialRowsRef.current = normalizedMembers
      setRows(normalizedMembers)
    }
  }, [open, normalizedMembers])

  const handleCellChange = useCallback((rowIndex: number, columnId: keyof EditableRosterRow, value: string) => {
    setRows(prev => {
      if (!prev[rowIndex]) return prev
      const next = [...prev]
      next[rowIndex] = {
        ...next[rowIndex],
        [columnId]: value,
      } as EditableRosterRow
      return next
    })
  }, [])

  const handleRemoveRow = useCallback((rowIndex: number) => {
    setRows(prev => prev.filter((_, index) => index !== rowIndex))
  }, [])

  const handleAddRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyEditableRow()])
  }, [])

  const handleDuplicateLast = useCallback(() => {
    setRows(prev => {
      if (!prev.length) return [createEmptyEditableRow()]
      const last = prev[prev.length - 1]
      return [...prev, { ...last }] as EditableRosterRow[]
    })
  }, [])

  const handleReset = useCallback(() => {
    setRows(initialRowsRef.current)
  }, [])

  const hasChanges = useMemo(() => JSON.stringify(initialRowsRef.current) !== JSON.stringify(rows), [rows])

  const columns = useMemo<ColumnDef<EditableRosterRow>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ getValue, row }) => (
          <Input
            value={getValue<string>() ?? ''}
            onChange={event => handleCellChange(row.index, 'name', event.target.value)}
            placeholder="Full name"
            className="h-8"
          />
        ),
      },
      {
        header: 'DOB',
        accessorKey: 'dob',
        cell: ({ getValue, row }) => (
          <DatePicker
            date={parseDobValue(getValue<string>() ?? '')}
            onDateChange={nextDate => handleCellChange(row.index, 'dob', formatDobValue(nextDate))}
            placeholder="YYYY-MM-DD"
            className="h-8 px-3 text-sm font-normal"
            captionLayout="dropdown"
            fromYear={earliestYear}
            toYear={currentYear}
          />
        ),
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ getValue, row }) => (
          <Input
            value={getValue<string>() ?? ''}
            onChange={event => handleCellChange(row.index, 'email', event.target.value)}
            placeholder="name@example.com"
            className="h-8"
            type="email"
          />
        ),
      },
      {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ getValue, row }) => (
          <Input
            value={getValue<string>() ?? ''}
            onChange={event => handleCellChange(row.index, 'phone', event.target.value)}
            placeholder="(555) 555-5555"
            className="h-8"
            type="tel"
          />
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ getValue, row }) => {
          const value = getValue<string>() || DEFAULT_ROLE
          return (
            <Select value={value} onValueChange={nextValue => handleCellChange(row.index, 'role', nextValue)}>
              <SelectTrigger className="h-8 w-full justify-between px-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRow(row.index)} aria-label="Remove row">
              <Trash2Icon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [currentYear, earliestYear, handleCellChange, handleRemoveRow]
  )

  const table = useReactTable<EditableRosterRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleCancel = useCallback(() => {
    setRows(initialRowsRef.current)
    onOpenChange(false)
  }, [onOpenChange])

  const handleSave = useCallback(() => {
    const sanitizedMembers: RegistrationMember[] = []

    rows.forEach(row => {
      const trimmedName = row.name.trim()
      const trimmedDob = row.dob.trim()
      const trimmedEmail = row.email.trim()
      const trimmedPhone = row.phone.trim()
      const trimmedRole = row.role.trim()

      if (!trimmedName && !trimmedEmail && !trimmedPhone && !trimmedDob && !trimmedRole) {
        return
      }

      sanitizedMembers.push({
        name: trimmedName || 'Unnamed',
        dob: trimmedDob || undefined,
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
        type: trimmedRole || DEFAULT_ROLE,
      })
    })

    const normalized = buildEditableRows(sanitizedMembers)
    initialRowsRef.current = normalized
    setRows(normalized)
    onSave(sanitizedMembers)
  }, [onSave, rows])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-[90vw] lg:max-w-[72rem] xl:max-w-[80rem] rounded-2xl gap-0 p-0">
        <div className="flex h-[82vh] flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Edit roster</DialogTitle>
            <DialogDescription>
              Update lineup details for <span className="font-medium text-foreground">{teamName}</span>. Make inline edits, add
              rows, or adjust roles as needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col px-6 pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" onClick={handleAddRow}>
                  Add row
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={handleDuplicateLast} disabled={!rows.length}>
                  Duplicate last row
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleReset} disabled={!hasChanges}>
                  Reset changes
                </Button>
              </div>
              <span className={cn('text-xs font-medium', hasChanges ? 'text-amber-600' : 'text-muted-foreground')}>
                {hasChanges ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border">
              <div className="h-full min-h-0 overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <colgroup>
                    {DATA_COLUMN_KEYS.map(key => (
                      <col
                        key={`data-column-${key}`}
                        style={{ width: `calc((100% - ${ACTIONS_COLUMN_WIDTH}px) / ${DATA_COLUMN_KEYS.length})` }}
                      />
                    ))}
                    <col style={{ width: `${ACTIONS_COLUMN_WIDTH}px` }} />
                  </colgroup>
                  <thead className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => {
                          const headerKey = header.column.id as DataColumnKey | 'actions'
                          const style =
                            headerKey === 'actions'
                              ? { width: `${ACTIONS_COLUMN_WIDTH}px` }
                              : { minWidth: `${columnMinWidths[headerKey]}ch` }
                          return (
                            <th key={header.id} className="px-3 py-2 text-left" style={style}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          )
                        })}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="border-b">
                          {row.getVisibleCells().map(cell => {
                            const cellKey = cell.column.id as DataColumnKey | 'actions'
                            const minWidth =
                              cellKey === 'actions' ? undefined : `${columnMinWidths[cellKey]}ch`
                            const style = cellKey === 'actions' ? { width: `${ACTIONS_COLUMN_WIDTH}px` } : { minWidth }
                            return (
                              <td key={cell.id} className="px-3 py-2 align-top min-w-0" style={style}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={table.getAllLeafColumns().length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          Add rows to begin editing this roster.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 border-t border-border/60 bg-background px-6 pb-6 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-4">
            <div className="flex flex-1 items-center sm:justify-start">
              {onDeleteTeam ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    onDeleteTeam()
                    onOpenChange(false)
                  }}
                >
                  Remove team
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={!hasChanges}>
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
