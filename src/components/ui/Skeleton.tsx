export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-shimmer rounded-xl bg-[linear-gradient(90deg,#efe9cf_0%,#f8f5e6_50%,#efe9cf_100%)] bg-[length:800px_100%] ${className}`}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="İlanlar yükleniyor">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
