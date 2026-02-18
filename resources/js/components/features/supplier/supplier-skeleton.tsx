import { DataTableSkeleton } from "@/components/ui/data-table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fallbacks/skeleton"
import { SectionHeader } from "../../ui/common/section-header"

export const SupplierSkeleton = () => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <SectionHeader
        headerTitle="Supplier"
        headerSubtitle="Manage item suppliers and vendor information"
      />

      <div className="flex flex-col items-start justify-between gap-4 py-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-9 w-62.5 lg:w-87.5" />
          <Skeleton className="h-9 w-25" />
        </div>
        <Skeleton className="h-9 w-35" />
      </div>

      <DataTableSkeleton rows={10} />
    </div>
  )
}
