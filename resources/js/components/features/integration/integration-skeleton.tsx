import { Card, CardContent } from "@/components/ui/common/card"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"

const IntegrationCardSkeleton = () => {
  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Skeleton className="h-8 w-8 rounded shrink-0" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>

          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export const IntegrationsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      </div>
    </div>
  )
}
