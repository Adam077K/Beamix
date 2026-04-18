import { StatCardSkeleton } from '@/components/ui/loading-skeleton'

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-fade-in">
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}
