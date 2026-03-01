import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SignupForm } from './signup-form'

export default function SignupPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] w-full rounded-[var(--card-radius)]" />}>
      <SignupForm />
    </Suspense>
  )
}
