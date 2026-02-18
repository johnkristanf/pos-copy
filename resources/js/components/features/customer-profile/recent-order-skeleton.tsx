import { Skeleton } from "@/components/ui/fallbacks/skeleton"

export const RecentOrderSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/50 animate-pulse">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  )
}
