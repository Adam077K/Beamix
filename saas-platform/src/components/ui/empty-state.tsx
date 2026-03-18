import { cn } from '@/lib/utils'
import { Button } from './button'
import type { LucideIcon } from 'lucide-react'

type EmptyStateVariant = 'default' | 'fullPage' | 'inline'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: EmptyStateVariant
  className?: string
}

const variantStyles: Record<EmptyStateVariant, string> = {
  default: 'py-16',
  fullPage: 'py-24',
  inline: 'py-6',
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isInline = variant === 'inline'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variantStyles[variant],
        className
      )}
    >
      {!isInline && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3
        className={cn(
          'font-medium text-foreground',
          isInline ? 'text-sm' : 'text-lg'
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'mt-1 text-muted-foreground',
          isInline ? 'text-xs max-w-xs' : 'text-sm max-w-sm'
        )}
      >
        {description}
      </p>
      {action && !isInline && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
      {action && isInline && (
        <Button
          onClick={action.onClick}
          variant="ghost"
          size="sm"
          className="mt-3"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
