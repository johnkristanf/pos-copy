import { AlertTriangle, ClipboardList, PackageCheck } from "lucide-react"
import { KpiCard } from "./kpi-card"

interface InventoryOfficerStatsProps {
  stats: {
    pending_orders_count: number
    items_to_release_count: number
    low_stock_count: number
  }
}

export const InventoryOfficerStats = ({
  stats,
}: InventoryOfficerStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <KpiCard
        title="Pending Orders"
        icon={ClipboardList}
        value={stats.pending_orders_count.toString()}
        label="Orders waiting for release"
        actionLink={undefined}
      />
      <KpiCard
        title="Items to Release"
        icon={PackageCheck}
        value={stats.items_to_release_count.toString()}
        label="Total individual items"
        trend="positive"
      />
      <KpiCard
        title="Low Stock Alerts"
        icon={AlertTriangle}
        value={stats.low_stock_count.toString()}
        label="Items below reorder point"
        trend={stats.low_stock_count > 0 ? "negative" : "positive"}
      />
    </div>
  )
}
