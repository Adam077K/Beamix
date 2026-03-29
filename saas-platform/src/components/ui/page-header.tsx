import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-8', className)}>
      <div>
        {eyebrow && (
          <p className="text-label mb-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-display text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {(actions || children) && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {children}
        </div>
      )}
    </div>
  )
}
