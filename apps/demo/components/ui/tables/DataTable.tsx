'use client'

import * as React from 'react'
import { cn } from '@workspace/ui/lib/utils'

// ============================================================================
// DataTable - Container
// ============================================================================

type DataTableProps = React.ComponentProps<'table'> & {
  /** 
   * Table variant:
   * - 'default': Card-style container with border, rounded corners, and background
   * - 'minimal': No container, just the table
   */
  variant?: 'default' | 'minimal'
}

/**
 * Styled data table component matching the Cheerbase design system.
 * Use this for consistent table styling across the app.
 * 
 * @example
 * ```tsx
 * <DataTable>
 *   <DataTableHeader>
 *     <tr>
 *       <DataTableHead>Name</DataTableHead>
 *       <DataTableHead className="text-right">Status</DataTableHead>
 *     </tr>
 *   </DataTableHeader>
 *   <DataTableBody>
 *     {data.map((row, index) => (
 *       <DataTableRow key={row.id} animationDelay={index * 40}>
 *         <DataTableCell className="font-medium text-foreground">{row.name}</DataTableCell>
 *         <DataTableCell className="text-right">...</DataTableCell>
 *       </DataTableRow>
 *     ))}
 *   </DataTableBody>
 * </DataTable>
 * ```
 */
function DataTable({ className, variant = 'default', children, ...props }: DataTableProps) {
  const table = (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full table-auto text-left text-sm', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )

  if (variant === 'minimal') return table

  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-card/60">
      {table}
    </div>
  )
}

// ============================================================================
// DataTableHeader - thead
// ============================================================================

function DataTableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('bg-muted/40 text-muted-foreground', className)}
      {...props}
    />
  )
}

// ============================================================================
// DataTableBody - tbody
// ============================================================================

function DataTableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={className} {...props} />
}

// ============================================================================
// DataTableRow - tr
// ============================================================================

type DataTableRowProps = React.ComponentProps<'tr'> & {
  /** Animation delay in milliseconds for staggered row animations */
  animationDelay?: number
  /** Whether to show the row animation (default: true) */
  animated?: boolean
}

function DataTableRow({ 
  className, 
  animationDelay,
  animated = true,
  style,
  ...props 
}: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'border-t border-border/50',
        animated && 'dropdown-fade-in',
        className
      )}
      style={{
        ...style,
        ...(animated && animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : {}),
      }}
      {...props}
    />
  )
}

// ============================================================================
// DataTableHead - th
// ============================================================================

function DataTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn('px-3 py-3 font-medium sm:px-4', className)}
      {...props}
    />
  )
}

// ============================================================================
// DataTableCell - td
// ============================================================================

function DataTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn('px-3 py-3 sm:px-4', className)}
      {...props}
    />
  )
}

// ============================================================================
// Exports
// ============================================================================

export { 
  DataTable, 
  DataTableHeader, 
  DataTableBody, 
  DataTableRow, 
  DataTableHead, 
  DataTableCell,
  type DataTableProps,
  type DataTableRowProps,
}


