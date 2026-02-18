import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"

export function CreateOrderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center space-x-2">
              <Skeleton className="h-9 w-62.5" />
              <Skeleton className="h-9 w-25" />
            </div>
          </div>
          <DataTableSkeleton rows={8} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="pt-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
