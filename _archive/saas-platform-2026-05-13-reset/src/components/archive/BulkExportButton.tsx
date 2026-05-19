'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, ChevronDown, Loader2 } from 'lucide-react'

interface BulkExportButtonProps {
  /** IDs of items to export. If empty, exports all. */
  selectedIds?: string[]
  className?: string
}

export function BulkExportButton({ selectedIds, className }: BulkExportButtonProps) {
  const [loading, setLoading] = useState<'csv' | 'json' | null>(null)

  async function handleExport(format: 'csv' | 'json') {
    setLoading(format)
    try {
      const params = new URLSearchParams()
      params.set('format', format)
      if (selectedIds && selectedIds.length > 0) {
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
      // handle error silently — user can retry
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={className}
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          Export all
          <ChevronDown size={13} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="gap-2 text-sm cursor-pointer"
          onSelect={() => handleExport('csv')}
          disabled={loading !== null}
        >
          <Download size={13} className="text-gray-400" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 text-sm cursor-pointer"
          onSelect={() => handleExport('json')}
          disabled={loading !== null}
        >
          <Download size={13} className="text-gray-400" />
          Download JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
