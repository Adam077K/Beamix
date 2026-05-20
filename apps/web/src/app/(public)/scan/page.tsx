import { EmptyState } from '@/components/empty-state'

export default function ScanPage() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6">
      <EmptyState
        illustration="scan"
        title="Free scan"
        description="Coming Wave 1 — enter your business name and we'll scan your AI search visibility across ChatGPT, Gemini, and Perplexity."
      />
    </main>
  )
}
