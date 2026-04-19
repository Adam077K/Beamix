'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface KillSwitchConfirmProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function KillSwitchConfirm({ open, onConfirm, onCancel }: KillSwitchConfirmProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
            <AlertTriangle className="size-4 text-amber-600" />
          </div>
          <DialogTitle className="text-base font-semibold text-gray-900">
            Pause all automation?
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            All scheduled agents will stop running until you re-enable automation. Any queued runs
            will be cancelled.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
            onClick={onConfirm}
          >
            Pause all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
