import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { PaginatedOrders } from "@/types"
import { getCancelledOrdersColumns } from "./cancelled-orders-columns"
import { CancelledOrdersToolbar } from "./cancelled-orders-toolbar"
import { MobileCancelledOrdersCard } from "./mobile-cancelled-orders-card"

interface CancelledOrdersSectionProps {
  orders: PaginatedOrders
}

export const CancelledOrdersSection = ({
  orders,
}: CancelledOrdersSectionProps) => {
  const ordersColumns = useMemo(() => getCancelledOrdersColumns(), [])

  const pagination: PaginationInfo = {
    currentPage: orders.current_page,
    totalPages: orders.last_page,
    totalItems: orders.total,
    itemsPerPage: orders.per_page,
    hasNextPage: orders.current_page < orders.last_page,
    hasPreviousPage: orders.current_page > 1,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Cancelled Orders</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage currently cancelled customer orders
          </p>
        </div>
      </div>

      <DataTable
        data={orders.data}
        pagination={pagination}
        useInertia={true}
        columns={ordersColumns}
        toolbar={<CancelledOrdersToolbar />}
        searchPlaceholder="Search canceled orders..."
        emptyMessage="No canceled orders found"
        mobileCardComponent={(order) => (
          <MobileCancelledOrdersCard order={order} />
        )}
        enableMobileCards={true}
      />
    </div>
  )
}
