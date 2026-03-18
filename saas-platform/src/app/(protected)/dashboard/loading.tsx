import { StatCardSkeleton, ChartSkeleton, TableSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <ChartSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TableSkeleton rows={4} columns={3} />
        <ListSkeleton items={4} />
      </div>
    </div>
  )
}
