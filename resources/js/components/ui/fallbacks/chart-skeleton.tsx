import { Skeleton } from "./skeleton"

export const ChartSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="space-y-0 pb-2 border-b bg-gray-50 p-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="pt-6 p-4">
        <div className="flex flex-col gap-1 mb-6">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-end gap-2">
            <Skeleton className="h-10 w-28" />
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>

        <div className="h-80 w-full flex flex-col justify-end gap-2">
          {/* Simulated bar chart */}
          <div className="flex items-end justify-around h-full gap-2">
            {[65, 45, 80, 55, 70, 40, 60, 75, 50, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Skeleton
                  className="w-full rounded-t-md"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
          {/* X-axis labels */}
          <div className="flex justify-around gap-2 mt-2">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
