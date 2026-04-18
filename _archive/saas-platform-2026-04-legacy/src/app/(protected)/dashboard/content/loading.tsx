import { TableSkeleton } from '@/components/ui/loading-skeleton'

export default function ContentLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <TableSkeleton rows={8} columns={4} />
    </div>
  )
}
