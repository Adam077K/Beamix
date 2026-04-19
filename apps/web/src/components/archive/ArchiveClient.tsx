'use client'

import { BulkExportButton } from './BulkExportButton'
import { ExportMenu } from './ExportMenu'
import { PublishToggle } from './PublishToggle'
import { VerificationChip } from './VerificationChip'
import type { VerificationStatus } from './VerificationChip'
import { Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArchiveItem {
  id: string
  actionLabel: string
  approvedAt: string
  publishedAt: string | null
  targetUrl: string | null
  verificationStatus: string
  estimatedImpact: 'high' | 'medium' | 'low'
  formats: string[]
}

interface ArchiveClientProps {
  items: ArchiveItem[]
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

const impactColors: Record<string, string> = {
  high: 'text-emerald-700 bg-emerald-50',
  medium: 'text-amber-700 bg-amber-50',
  low: 'text-gray-500 bg-gray-100',
}

export function ArchiveClient({ items }: ArchiveClientProps) {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Archive
        </h1>
        {/* Scale-only bulk export */}
        <BulkExportButton />
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <Archive size={28} className="text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500">Approved content lives here.</p>
          <p className="mt-1 text-xs text-gray-400">
            Run an agent from Home to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label="Archived items">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-150 hover:shadow-sm"
            >
              {/* Top row: label + chips */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-gray-900 text-sm leading-snug">
                    {item.actionLabel}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium capitalize shrink-0',
                      impactColors[item.estimatedImpact] ?? 'text-gray-500 bg-gray-100'
                    )}
                  >
                    {item.estimatedImpact} impact
                  </span>
                </div>
                <VerificationChip status={item.verificationStatus as VerificationStatus} />
              </div>

              {/* Subtext */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                {item.targetUrl && (
                  <a
                    href={item.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3370FF] transition-colors duration-150 truncate max-w-[220px]"
                  >
                    {item.targetUrl}
                  </a>
                )}
                <span>Approved {formatDate(item.approvedAt)}</span>
                {item.publishedAt && (
                  <span>Published {formatDate(item.publishedAt)}</span>
                )}
              </div>

              {/* Bottom row: publish toggle + export */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <PublishToggle
                  itemId={item.id}
                  isPublished={item.publishedAt !== null}
                />
                <ExportMenu
                  itemId={item.id}
                  markdownContent={`# ${item.actionLabel}\n\nApproved: ${item.approvedAt}\n`}
                  htmlContent={
                    item.formats.includes('html')
                      ? `<h1>${item.actionLabel}</h1>`
                      : undefined
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
