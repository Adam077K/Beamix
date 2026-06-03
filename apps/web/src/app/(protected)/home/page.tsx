import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// GhostedFeedPreview — a 40%-opacity skeleton of the real workspace activity
// feed, so the first-run user sees the SHAPE of value (DESIGN-DIRECTION §4.3),
// not a doc-icon void. This is the reference wiring of the selling EmptyState.
// ---------------------------------------------------------------------------

function GhostedFeedPreview() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[14px] border border-[#E5E7EB] bg-white p-4 text-left"
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#EFF4FF]" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-[#E5E7EB]" />
            <div className="h-2 w-1/3 rounded bg-[#F3F4F6]" />
          </div>
          <div className="h-6 w-14 shrink-0 rounded-md bg-[#F3F4F6]" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6">
      <EmptyState
        preview={<GhostedFeedPreview />}
        title="Nothing to review yet"
        description="Your agents are standing by. Run a scan and Beamix starts finding where you're invisible in AI search."
        action={
          <Button asChild>
            <a href="/scan">Start a scan →</a>
          </Button>
        }
      />
    </main>
  )
}
