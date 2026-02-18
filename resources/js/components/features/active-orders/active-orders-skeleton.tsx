import { match } from "ts-pattern"
import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"
import { cn } from "@/lib/cn"

interface ActiveOrdersSkeletonProps {
  isCashier?: boolean
  isInventoryOfficer?: boolean
}

export function ActiveOrdersSkeleton({
  isCashier,
  isInventoryOfficer,
}: ActiveOrdersSkeletonProps) {
  const showSidebar = isCashier || isInventoryOfficer

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32 sm:w-48" />
          <Skeleton className="h-4 w-48 sm:w-72" />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-4",
          match(showSidebar)
            .with(true, () => "lg:flex-row lg:items-start")
            .otherwise(() => ""),
        )}
      >
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-9 w-full sm:w-62.5" />
              <Skeleton className="h-9 w-25" />
            </div>
            <Skeleton className="h-9 w-30" />
          </div>

          <div className="rounded-md border bg-card">
            <DataTableSkeleton rows={5} />
          </div>
        </div>

        {match(showSidebar)
          .with(true, () => (
            <div className="flex w-full flex-col gap-4 lg:w-77.5 shrink-0 lg:sticky lg:top-4">
              <Skeleton className="h-50 w-full rounded-xl" />
              <Skeleton className="h-37.5 w-full rounded-xl" />
            </div>
          ))
          .otherwise(() => null)}
      </div>
    </div>
  )
}
