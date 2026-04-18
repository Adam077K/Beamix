import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton'

export default function RankingsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <ChartSkeleton />
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}
