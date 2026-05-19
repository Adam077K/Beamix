'use client'

import * as React from 'react'
import { OctagonX } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface KillSwitchConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function KillSwitchConfirm({ open, onConfirm, onCancel }: KillSwitchConfirmProps) {
  const [typed, setTyped] = React.useState('')
  const confirmed = typed.trim() === 'PAUSE'

  React.useEffect(() => {
    if (!open) setTyped('')
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg border border-red-200 bg-red-50">
            <OctagonX className="size-5 text-red-600" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-base font-semibold text-gray-900">
            Pause all automation?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Every scheduled agent will stop running immediately. Queued runs are cancelled and
            won&apos;t be retried until you re-enable automation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 flex flex-col gap-1.5">
          <label htmlFor="kill-confirm-input" className="text-xs font-medium text-gray-700">
            Type{' '}
            <span className="font-mono font-semibold text-red-600">PAUSE</span>
            {' '}to confirm
          </label>
          <Input
            id="kill-confirm-input"
            type="text"
            placeholder="PAUSE"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className={cn(
              'font-mono text-sm transition-colors duration-150',
              confirmed && 'border-red-400 bg-red-50/50',
            )}
          />
        </div>

        <DialogFooter className="mt-3">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Keep running
          </Button>
          <Button
            size="sm"
            disabled={!confirmed}
            className={cn(
              'transition-all duration-150 active:scale-[0.98] focus-visible:ring-red-500',
              confirmed
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'cursor-not-allowed bg-red-200 text-red-400',
            )}
            onClick={onConfirm}
          >
            Pause all automation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
