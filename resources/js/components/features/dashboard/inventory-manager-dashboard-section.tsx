import { router } from "@inertiajs/react"
import { AlertCircle, ArrowUpRight, Package } from "lucide-react"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { formatCurrency } from "@/lib/format"
import { CategoryDistribution } from "./category-distribution"
import { KpiCard } from "./kpi-card"
import { LowStockAlertsTable } from "./low-stock-alerts-table"
import { RecentInventoryActivities } from "./recent-movements-log"
import { TopCustomer } from "./top-customer"
import { TopSellingProducts } from "./top-selling-products"
import { TotalRevenue } from "./total-revenue"

interface InventoryManagerDashboardSectionProps {
  kpis: {
    total_items: number
    total_stock_on_hand: number
    inventory_value: number
    out_of_stock_count: number
  }
  low_stock_alerts:
    | Array<{
        id: number
        sku: string
        name: string
        current_level: number
        reorder_point: number
        status: "Critical" | "Low"
      }>
    | Record<string, any>
    | undefined
  recent_movements: Array<{
    id: number
    event: string
    description: string
    causer: string
    time_ago: string
  }>
  monthlySales: { month: string; total: number }[]
  categoryPercentage: { name: string; total: number }[]
  stock_distribution: { name: string; total: number | string; unit: string }[]
  salesPercentage: { description: string; total: number }[]
  customerPercentage: { name: string; total: number }[]
  selectedYear?: string
  availableYears?: string[]
}

export const InventoryManagerDashboardSection = ({
  kpis,
  low_stock_alerts,
  recent_movements,
  monthlySales,
  // categoryPercentage,
  stock_distribution,
  salesPercentage,
  customerPercentage,
  selectedYear,
  availableYears,
}: InventoryManagerDashboardSectionProps) => {
  useRealtimeReload("stocks", ".stock.modified", [
    "kpis",
    "low_stock_alerts",
    "stock_distribution",
  ])

  useRealtimeReload("items", ".item.modified", ["kpis", "low_stock_alerts"])

  useRealtimeReload("activity-logs", ".activity-log.modified", [
    "recent_movements",
  ])

  useRealtimeReload("orders", ".order.modified", [
    "monthly_sales",
    "category_percentage",
    "sales_percentage",
    "customer_percentage",
  ])

  useRealtimeReload("payments", ".payment.modified", [
    "monthly_sales",
    "category_percentage",
    "sales_percentage",
    "customer_percentage",
  ])

  const handleYearChange = (year: string) => {
    router.get(
      PAGE_ROUTES.DASHBOARD_PAGE,
      { year },
      {
        preserveState: true,
        preserveScroll: true,
        only: [
          "monthly_sales",
          "category_percentage",
          "sales_percentage",
          "customer_percentage",
          "selected_year",
        ],
      },
    )
  }

  const alertsArray = !low_stock_alerts
    ? []
    : Array.isArray(low_stock_alerts)
      ? low_stock_alerts
      : Object.values(low_stock_alerts)

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Items"
          value={kpis.total_items.toString()}
          icon={Package}
          label="Active products in catalog"
        />
        <KpiCard
          title="Stock on Hand"
          value={kpis.total_stock_on_hand.toString()}
          icon={ArrowUpRight}
          label="Total units across locations"
        />
        <KpiCard
          title="Inventory Value"
          value={formatCurrency(kpis.inventory_value)}
          icon={Package}
          label="Estimated market value"
        />
        <KpiCard
          title="Out of Stock"
          value={kpis.out_of_stock_count.toString()}
          icon={AlertCircle}
          label="Items requiring immediate restock"
          trend={kpis.out_of_stock_count > 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid gap-4 sm:gap-4 lg:grid-cols-12 auto-rows-fr">
        <div className="lg:col-span-8 h-80">
          <LowStockAlertsTable alerts={alertsArray as any} />
        </div>
        <div className="lg:col-span-4 h-80">
          <RecentInventoryActivities movements={recent_movements} />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-4 grid-cols-1 lg:grid-cols-12 auto-rows-fr">
        <div className="lg:col-span-8 h-90">
          <TotalRevenue
            data={monthlySales}
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={handleYearChange}
          />
        </div>
        <div className="lg:col-span-4 h-90">
          <TopSellingProducts data={salesPercentage} />
        </div>
        <div className="lg:col-span-6 h-80">
          <CategoryDistribution data={stock_distribution} />
        </div>
        <div className="lg:col-span-6 h-80">
          <TopCustomer data={customerPercentage} />
        </div>
      </div>
    </div>
  )
}
