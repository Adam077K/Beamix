'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Copy, FileJson, FileText, Braces } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportMenuProps {
  itemId: string
  markdownContent: string
  htmlContent?: string
  jsonContent?: string
  className?: string
}

type CopiedType = 'md' | 'html' | 'json' | null

export function ExportMenu({
  itemId: _itemId,
  markdownContent,
  htmlContent,
  jsonContent,
  className,
}: ExportMenuProps) {
  const [copied, setCopied] = useState<CopiedType>(null)

  async function copyToClipboard(content: string, type: Exclude<CopiedType, null>) {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(type)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // clipboard access denied — silent fail
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-1.5 text-xs text-gray-600 h-7 px-2.5 border-gray-200 hover:border-gray-300',
            className
          )}
        >
          Export
          <ChevronDown size={11} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="gap-2.5 text-sm cursor-pointer"
          onSelect={() => copyToClipboard(markdownContent, 'md')}
        >
          <FileText size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
          {copied === 'md' ? 'Copied!' : 'Copy Markdown'}
        </DropdownMenuItem>
        {htmlContent && (
          <DropdownMenuItem
            className="gap-2.5 text-sm cursor-pointer"
            onSelect={() => copyToClipboard(htmlContent, 'html')}
          >
            <Braces size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
            {copied === 'html' ? 'Copied!' : 'Copy HTML'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="gap-2.5 text-sm cursor-pointer"
          onSelect={() =>
            copyToClipboard(
              jsonContent ?? JSON.stringify({ content: markdownContent }, null, 2),
              'json'
            )
          }
        >
          <FileJson size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
          {copied === 'json' ? 'Copied!' : 'Copy JSON'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
