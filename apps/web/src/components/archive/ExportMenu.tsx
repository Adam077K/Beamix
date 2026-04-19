'use client'

import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Copy, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportMenuProps {
  itemId: string
  markdownContent: string
  htmlContent?: string
  className?: string
}

export function ExportMenu({ itemId: _itemId, markdownContent, htmlContent, className }: ExportMenuProps) {
  const [copied, setCopied] = useState<'md' | 'html' | null>(null)

  async function copyToClipboard(content: string, type: 'md' | 'html') {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(type)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // clipboard access denied
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className={cn('gap-1 text-gray-600', className)}
        >
          Export
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="gap-2 text-sm cursor-pointer"
          onSelect={() => copyToClipboard(markdownContent, 'md')}
        >
          <Copy size={13} className="text-gray-400" />
          {copied === 'md' ? 'Copied!' : 'Copy Markdown'}
        </DropdownMenuItem>
        {htmlContent && (
          <DropdownMenuItem
            className="gap-2 text-sm cursor-pointer"
            onSelect={() => copyToClipboard(htmlContent, 'html')}
          >
            <Code size={13} className="text-gray-400" />
            {copied === 'html' ? 'Copied!' : 'Copy HTML'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
