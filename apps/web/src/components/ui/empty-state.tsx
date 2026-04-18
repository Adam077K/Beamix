import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card } from './card'
import type { LucideIcon } from 'lucide-react'

type EmptyStateVariant = 'default' | 'fullPage' | 'inline' | 'card'

interface EmptyStateProps {
  icon?: LucideIcon
  illustration?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
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
  card: 'py-12',
}

function EmptyStateInner({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
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
      {!isInline && (illustration || Icon) && (
        <div className="mb-4">
          {illustration ?? (
            Icon && (
              <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            )
          )}
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
      {secondaryAction && !isInline && (
        <Button
          onClick={secondaryAction.onClick}
          variant="ghost"
          size="sm"
          className="mt-2"
        >
          {secondaryAction.label}
        </Button>
      )}
    </div>
  )
}

export function EmptyState(props: EmptyStateProps) {
  if (props.variant === 'card') {
    return (
      <Card className={cn('border-dashed', props.className)}>
        <EmptyStateInner {...props} className={undefined} />
      </Card>
    )
  }

  return <EmptyStateInner {...props} />
}
