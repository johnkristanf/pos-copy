import { Skeleton } from "@/components/ui/fallbacks/skeleton"

export const MeDetailsSkeleton = () => {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-200 pb-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />

            <div className="flex-1 space-y-4">
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-7 w-24 mb-1" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                      <Skeleton className="h-4 w-36 mb-1" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-7 w-36" />
              </div>
              <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="h-3 w-28 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-6 w-28" />
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <Skeleton className="h-3 w-26 mb-2" />
                <Skeleton className="h-6 w-30" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
