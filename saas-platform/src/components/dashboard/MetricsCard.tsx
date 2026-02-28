// ================================================
// Metrics Card Component
// ================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface MetricsCardProps {
  title: string
  value: string | number | null
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'stable'
  isLoading?: boolean
}

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isLoading = false,
}: MetricsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend === 'up') return 'text-green-600'
    if (trend === 'down') return 'text-red-600'
    return 'text-gray-400'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'stable') return '→'
    if (trend === 'up') return '↑'
    return '↓'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value !== null ? value : '—'}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`text-sm mt-2 ${getTrendColor()}`}>
            <span className="font-medium">{getTrendIcon()}</span>
            <span className="ml-1">
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'No change'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
