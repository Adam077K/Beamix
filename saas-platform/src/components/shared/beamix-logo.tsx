import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BeamixLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  href?: string
  className?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
}

export function BeamixLogo({ size = 'md', showWordmark = true, href = '/dashboard', className }: BeamixLogoProps) {
  const content = (
    <span className={cn('font-sans font-bold text-foreground', sizeClasses[size], className)}>
      {showWordmark ? (
        <>Beam<span className="text-primary">ix</span></>
      ) : (
        <span className="text-primary">B</span>
      )}
    </span>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}
