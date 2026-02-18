import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { FulfillmentQueue } from "./fullfillment-queue"
import { InventoryOfficerActivityFeed } from "./inventory-officer-activity-feed"
import { InventoryOfficerStats } from "./inventory-officer-stats"
import { LowStockAlertsTable } from "./low-stock-alerts-table"

interface InventoryOfficerDashboardSectionProps {
  stats: {
    pending_orders_count: number
    items_to_release_count: number
    low_stock_count: number
  }
  transactionQueue: Array<{
    id: number
    order_number: string
    customer_name: string
    items_count: number
    status: string
    time_ago: string
    priority: string
    items: Array<{
      item_name: string
      sku: string
      quantity_to_release: number
      bin_location: string
    }>
  }>
  lowStockAlerts:
    | Array<{
        id: number
        sku: string
        name: string
        current_level: number
        reorder_point: number
        severity: string
        location: string
      }>
    | Record<string, any>
  recentActivity: Array<{
    description: string
    time: string
    date: string
    type: string
  }>
}

export const InventoryOfficerDashboardSection = ({
  stats,
  transactionQueue,
  lowStockAlerts,
  recentActivity,
}: InventoryOfficerDashboardSectionProps) => {
  useRealtimeReload("orders", ".order.modified", ["transaction_queue", "stats"])
  useRealtimeReload("stocks", ".stock.modified", ["low_stock_alerts", "stats"])
  useRealtimeReload("activity-logs", ".activity-log.modified", [
    "recent_activity",
  ])

  const rawAlerts = lowStockAlerts || []
  const alertsArray = Array.isArray(rawAlerts)
    ? rawAlerts
    : Object.values(rawAlerts)

  const formattedAlerts = alertsArray.map((alert) => ({
    ...alert,
    status: (alert.severity === "critical" ? "Critical" : "Low") as
      | "Critical"
      | "Low",
  }))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <InventoryOfficerStats stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 min-h-125">
          <FulfillmentQueue queue={transactionQueue} />
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <div className="flex-1 min-h-75">
            <LowStockAlertsTable
              alerts={formattedAlerts}
              isInventoryOfficer={true}
            />
          </div>
          <div className="flex-1 min-h-75">
            <InventoryOfficerActivityFeed activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  )
}
