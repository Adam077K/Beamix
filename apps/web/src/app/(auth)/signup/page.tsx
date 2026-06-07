import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata = {
  title: 'Create account — Beamix',
  description: 'Get started with Beamix — done-for-you AI search visibility.',
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
