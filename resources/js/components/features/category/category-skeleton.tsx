import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"

export const CategorySkeleton = () => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-9 w-full sm:w-62.5" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-25" />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <DataTableSkeleton rows={10} />
        </div>

        <div className="flex items-center justify-between px-2">
          <Skeleton className="hidden h-4 w-50 sm:block" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
