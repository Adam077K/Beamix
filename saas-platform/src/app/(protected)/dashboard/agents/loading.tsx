import { StatCardSkeleton } from '@/components/ui/loading-skeleton'

export default function AgentsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
