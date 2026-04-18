import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-xl" />}>
      <LoginForm />
    </Suspense>
  )
}
