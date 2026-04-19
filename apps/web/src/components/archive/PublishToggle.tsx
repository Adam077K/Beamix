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
    if (loading) return
    setChecked(value)
    if (!onToggle) return
    setLoading(true)
    try {
      await onToggle(itemId, value)
    } catch {
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
        aria-label={checked ? 'Mark as unpublished' : 'Mark as published'}
        className={cn(
          'transition-colors duration-150',
          checked
            ? 'data-[state=checked]:bg-[#3370FF]'
            : 'data-[state=unchecked]:bg-gray-200'
        )}
      />
      <Label
        htmlFor={`publish-${itemId}`}
        className={cn(
          'text-xs cursor-pointer select-none transition-colors duration-150',
          checked ? 'text-[#3370FF] font-medium' : 'text-gray-400',
          loading && 'opacity-50'
        )}
      >
        {loading ? 'Saving…' : checked ? 'Published' : 'Mark as published'}
      </Label>
    </div>
  )
}
