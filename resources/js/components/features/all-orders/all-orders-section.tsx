import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect, useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { PaginatedOrders } from "@/types"
import { getAllOrdersColumns } from "./all-orders-column"
import { AllOrdersToolbar } from "./all-orders-toolbar"
import { MobileAllOrdersCard } from "./mobile-all-orders-card"

interface AllOrdersSectionProps {
  orders: PaginatedOrders
}

export function AllOrdersSection({ orders }: AllOrdersSectionProps) {
  const [highlightId, setHighlightId] = useQueryState(
    "highlight",
    parseAsInteger,
  )

  const ordersColumns = useMemo(() => getAllOrdersColumns(), [])

  const pagination: PaginationInfo = {
    currentPage: orders.current_page,
    totalPages: orders.last_page,
    totalItems: orders.total,
    itemsPerPage: orders.per_page,
    hasNextPage: orders.current_page < orders.last_page,
    hasPreviousPage: orders.current_page > 1,
  }

  useEffect(() => {
    if (highlightId) {
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(`order-${highlightId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 300)

      const clearTimer = setTimeout(() => {
        setHighlightId(null)
      }, 5000)

      return () => {
        clearTimeout(scrollTimer)
        clearTimeout(clearTimer)
      }
    }
  }, [highlightId, orders, setHighlightId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">All Orders</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            View and manage all customer orders
          </p>
        </div>
      </div>

      <DataTable
        data={orders.data}
        pagination={pagination}
        useInertia={true}
        columns={ordersColumns}
        toolbar={<AllOrdersToolbar />}
        searchPlaceholder="Search orders..."
        emptyMessage="No orders found"
        mobileCardComponent={(order) => <MobileAllOrdersCard order={order} />}
        enableMobileCards={true}
        getRowId={(order) => `order-${order.id}`}
        getRowClassName={(order) =>
          order.id === highlightId
            ? "bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border-y-2 border-transparent [border-image:linear-gradient(to_right,#349083,#e3ea4e)1] transition-all duration-1000"
            : ""
        }
      />
    </div>
  )
}
