'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PublishToggleProps {
  itemId: string
  isPublished: boolean
  onToggle?: (itemId: string, published: boolean) => Promise<void>
  disabled?: boolean
  className?: string
}

export function PublishToggle({
  itemId,
  isPublished,
  onToggle,
  disabled = false,
  className,
}: PublishToggleProps) {
  const [checked, setChecked] = useState(isPublished)
  const [loading, setLoading] = useState(false)

  async function handleChange(value: boolean) {
    if (!onToggle || loading) return
    setChecked(value)
    setLoading(true)
    try {
      await onToggle(itemId, value)
    } catch {
      // Revert on error
      setChecked(!value)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch
        id={`publish-${itemId}`}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={disabled || loading}
        size="sm"
      />
      <Label
        htmlFor={`publish-${itemId}`}
        className={cn(
          'text-xs cursor-pointer select-none',
          checked ? 'text-gray-700' : 'text-gray-400',
          loading && 'opacity-50'
        )}
      >
        {checked ? 'Published' : 'Mark as published'}
      </Label>
    </div>
  )
}
