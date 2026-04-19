'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, ChevronDown, Loader2, FileText, FileJson } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkExportButtonProps {
  /** IDs of items to export. If empty or undefined, exports all. */
  selectedIds?: string[]
  className?: string
}

export function BulkExportButton({ selectedIds, className }: BulkExportButtonProps) {
  const [loading, setLoading] = useState<'csv' | 'json' | null>(null)

  const hasSelection = selectedIds !== undefined && selectedIds.length > 0
  const isLoading = loading !== null

  async function handleExport(format: 'csv' | 'json') {
    setLoading(format)
    try {
      const params = new URLSearchParams()
      params.set('format', format)
      if (hasSelection) {
        params.set('ids', selectedIds.join(','))
      }

      const res = await fetch(`/api/archive/export?${params.toString()}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beamix-archive-${new Date().toISOString().slice(0, 10)}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent — user can retry
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasSelection ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'gap-1.5 transition-colors duration-150',
            hasSelection
              ? 'bg-[#3370FF] hover:bg-[#2860e8] text-white border-transparent'
              : 'text-gray-600 border-gray-200 hover:border-gray-300',
            className
          )}
          disabled={isLoading}
          aria-label={
            hasSelection
              ? `Export ${selectedIds.length} selected item${selectedIds.length === 1 ? '' : 's'}`
              : 'Export all items'
          }
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <Download size={13} aria-hidden="true" />
          )}
          {hasSelection ? `Export ${selectedIds.length}` : 'Export all'}
          <ChevronDown size={12} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="gap-2.5 text-sm cursor-pointer"
          onSelect={() => handleExport('csv')}
          disabled={isLoading}
        >
          <FileText size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 text-sm cursor-pointer"
          onSelect={() => handleExport('json')}
          disabled={isLoading}
        >
          <FileJson size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
          Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
