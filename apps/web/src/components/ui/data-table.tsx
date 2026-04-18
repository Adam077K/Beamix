'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Column meta extension — callers can pass `meta: { align: 'right' }` on
 * any ColumnDef to right-align that column's header and cells.
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'right' | 'center'
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Optional row-click handler. Adds cursor-pointer to each row. */
  onRowClick?: (row: TData) => void
  /** Return true to highlight that row (e.g. "You" row in a leaderboard). */
  highlightRow?: (row: TData) => boolean
  /** Message shown when data array is empty. */
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  highlightRow,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm">
        {/* ── Header ───────────────────────────────────────────────── */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = header.column.columnDef.meta?.align ?? 'left'
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    scope="col"
                    className={cn(
                      'bg-muted/50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
                      'first:rounded-tl-md last:rounded-tr-md',
                      align === 'right' && 'text-right',
                      align === 'center' && 'text-center',
                      canSort && 'cursor-pointer select-none',
                    )}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : canSort
                            ? 'none'
                            : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <SortIcon sorted={sorted} />
                        )}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isHighlighted = highlightRow?.(row.original) ?? false

              return (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-border/50 last:border-0 transition-colors duration-150',
                    'hover:bg-[var(--row-hover)]',
                    isHighlighted && 'bg-primary/5 border-l-2 border-l-primary',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align ?? 'left'
                    const isNumeric = align === 'right'

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-4 py-3',
                          align === 'right' && 'text-right',
                          align === 'center' && 'text-center',
                          isNumeric && 'tabular-nums',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Internal helper ───────────────────────────────────────────────────────────

interface SortIconProps {
  sorted: false | 'asc' | 'desc'
}

function SortIcon({ sorted }: SortIconProps) {
  if (sorted === 'asc') {
    return <ArrowUp className="h-3 w-3 shrink-0" aria-hidden="true" />
  }
  if (sorted === 'desc') {
    return <ArrowDown className="h-3 w-3 shrink-0" aria-hidden="true" />
  }
  return (
    <ArrowUpDown
      className="h-3 w-3 shrink-0 opacity-40 group-hover:opacity-70"
      aria-hidden="true"
    />
  )
}
