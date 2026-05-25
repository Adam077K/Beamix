import { EmptyState } from '@/components/empty-state'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <EmptyState
          illustration="auth"
          title="Sign up"
          description="Coming Wave 1 — Supabase Auth will be wired here."
        />
      </div>
    </main>
  )
}
