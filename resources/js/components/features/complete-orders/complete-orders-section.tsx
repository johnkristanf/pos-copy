import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { PaginatedOrders } from "@/types"
import { getCompleteOrdersColumns } from "./complete-orders-columns"
import { CompleteOrdersToolbar } from "./complete-orders-toolbar"
import { MobileCompleteOrdersCard } from "./mobile-active-orders-card"

interface CompleteOrdersSectionProps {
  orders: PaginatedOrders
}

export const CompleteOrdersSection = ({
  orders,
}: CompleteOrdersSectionProps) => {
  const ordersColumns = useMemo(() => getCompleteOrdersColumns(), [])

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
          <h2 className="text-lg sm:text-xl font-semibold">Complete Orders</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Manage currently active customer orders
          </p>
        </div>
      </div>

      <DataTable
        data={orders.data}
        pagination={pagination}
        useInertia={true}
        columns={ordersColumns}
        toolbar={<CompleteOrdersToolbar />}
        searchPlaceholder="Search complete orders..."
        emptyMessage="No complete orders found"
        mobileCardComponent={(order) => (
          <MobileCompleteOrdersCard order={order} />
        )}
        enableMobileCards={true}
      />
    </div>
  )
}
