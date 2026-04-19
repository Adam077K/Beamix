'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export type VerificationStatus = 'pending' | 'verified' | 'unverified' | 'failed'

interface VerificationChipProps {
  status: VerificationStatus
  className?: string
}

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ElementType; classes: string }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  unverified: {
    label: 'Unverified',
    icon: XCircle,
    classes: 'bg-gray-50 text-gray-500 border-gray-200',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    classes: 'bg-red-50 text-red-600 border-red-200',
  },
}

export function VerificationChip({ status, className }: VerificationChipProps) {
  const config = statusConfig[status] ?? statusConfig.unverified
  const { label, icon: Icon, classes } = config

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        classes,
        className
      )}
    >
      <Icon size={11} className="shrink-0" aria-hidden="true" />
      {label}
    </span>
  )
}
