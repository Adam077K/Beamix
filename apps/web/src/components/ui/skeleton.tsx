import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-[#F3F4F6]', className)}
      {...props}
    />
  );
}

// Named skeleton variants for common async surfaces
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-[#E5E7EB] bg-white p-6 space-y-3', className)}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full opacity-75" style={{ opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
