import { parseAsInteger, useQueryState } from "nuqs"
import { useEffect, useMemo, useState } from "react"
import { match } from "ts-pattern"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaginationInfo } from "@/components/ui/data-table/data-table-pagination"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { cn } from "@/lib/cn"
import { Order, PaginatedOrders, User } from "@/types"
import { ActiveOrderPaymentMethod } from "./active-order-payment-method"
import { ActiveOrderSummary } from "./active-order-summary"
import { getActiveOrdersColumns } from "./active-orders-columns"
import { ActiveOrdersToolbar } from "./active-orders-toolbar"
import { MobileActiveOrdersCard } from "./mobile-active-orders-card"
import { ServeOrderItems } from "./serve-order-items"

interface ActiveOrdersSectionProps {
  orders: PaginatedOrders
  isCashier?: boolean
  isInventoryOfficer?: boolean
  isSalesOfficer?: boolean
  user: User
}

export const ActiveOrdersSection = ({
  orders,
  isCashier,
  isInventoryOfficer,
  isSalesOfficer,
  user,
}: ActiveOrdersSectionProps) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [syncedTotalPayable, setSyncedTotalPayable] = useState(0)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isVatEnabled, setIsVatEnabled] = useState(false)
  const [highlightOrderId, setHighlightOrderId] = useQueryState(
    "highlight_order_id",
    parseAsInteger,
  )

  const { viewWrapper } = useRolePermissionFeatureViewer()
  const canPerformActions = viewWrapper([], ["create_order"], [], ["delete"])

  useEffect(() => {
    if (highlightOrderId && orders?.data) {
      const targetOrder = orders.data.find((o) => o.id === highlightOrderId)

      if (targetOrder) {
        setSelectedOrder(targetOrder)
        setIsHighlighted(true)

        setTimeout(() => {
          const element = document.getElementById(`order-${highlightOrderId}`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 300)

        const timer = setTimeout(() => {
          setIsHighlighted(false)
          setHighlightOrderId(null)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [highlightOrderId, orders, setHighlightOrderId])

  const ordersColumns = useMemo(
    () =>
      getActiveOrdersColumns(
        selectedOrder?.id || null,
        (order) => setSelectedOrder(order === selectedOrder ? null : order),
        isSalesOfficer,
        canPerformActions,
      ),
    [selectedOrder, isSalesOfficer, user, canPerformActions],
  )

  if (!orders) return null

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
      <SectionHeader
        headerTitle="Active Orders"
        headerSubtitle="Manage currently active customer orders"
      />
      <div
        className={cn(
          "flex flex-col gap-4",
          match(isCashier)
            .with(true, () => "lg:flex-row lg:items-start")
            .otherwise(() => ""),
        )}
      >
        <div className="flex-1 w-full min-w-0 space-y-4">
          <DataTable
            data={orders.data}
            pagination={pagination}
            useInertia={true}
            columns={ordersColumns}
            toolbar={<ActiveOrdersToolbar />}
            searchPlaceholder="Search active orders..."
            emptyMessage="No active orders found"
            mobileCardComponent={(order) => (
              <MobileActiveOrdersCard order={order} />
            )}
            enableMobileCards={true}
            getRowId={(order) => `order-${order.id}`}
            getRowClassName={(order) =>
              match(order.id === selectedOrder?.id)
                .with(true, () =>
                  cn(
                    "transition-all duration-1000",
                    isHighlighted
                      ? "bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border-y-2 border-transparent [border-image:linear-gradient(to_right,#349083,#e3ea4e)1]"
                      : "bg-muted/50",
                  ),
                )
                .otherwise(() => "hover:bg-muted/50 transition-colors")
            }
          />
        </div>

        {match({ isCashier })
          .with({ isCashier: true }, () => (
            <div className="flex w-full flex-col gap-4 lg:w-77.5 shrink-0 lg:sticky lg:top-4">
              <ActiveOrderSummary
                selectedOrder={selectedOrder}
                onTotalPayableChange={setSyncedTotalPayable}
                isVatEnabled={isVatEnabled}
                onVatChange={setIsVatEnabled}
              />
              <ActiveOrderPaymentMethod
                selectedOrder={selectedOrder}
                user={user}
                totalPayable={syncedTotalPayable}
                isVatEnabled={isVatEnabled}
              />
            </div>
          ))
          .otherwise(() => null)}
      </div>

      {isInventoryOfficer && (
        <ServeOrderItems
          selectedOrder={selectedOrder}
          open={!!selectedOrder}
          onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
