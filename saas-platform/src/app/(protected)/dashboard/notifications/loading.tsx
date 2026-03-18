import { ListSkeleton } from '@/components/ui/loading-skeleton'

export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <ListSkeleton items={8} />
    </div>
  )
}
