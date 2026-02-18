import { router } from "@inertiajs/react"
import { AlertCircle, FileWarning, Tag, Ticket } from "lucide-react"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { ActionNeeded } from "./action-needed"
import { CategoryDistribution } from "./category-distribution"
import { KpiCard } from "./kpi-card"
import { RecentPriceUpdates } from "./recent-price-updates"
import { TopCustomer } from "./top-customer"
import { TotalRevenue } from "./total-revenue"

interface MerchandiserDashboardSectionProps {
  action_items: {
    unpriced_items: Array<{
      id: number
      sku: string
      name: string
      stock_count: number
    }>
    slow_moving_stock: Array<{ name: string; reason: string }>
  }
  kpis: {
    active_vouchers: number
    vouchers_redeemed_total: number
  }
  recent_price_changes: Array<{
    item: string
    sku: string
    old_price: number
    new_price: number
    changed_at: string
  }>
  category_distribution: Array<{ name: string; total: number }>
  charts: {
    monthly_sales: Array<{ month: string; total: number }>
    category_sales: Array<{ name: string; total: number }>
    customer_sales: Array<{ name: string; total: number }>
  }
  selectedYear?: string
  availableYears?: string[]
}

export const MerchandiserDashboardSection = ({
  action_items,
  kpis,
  recent_price_changes,
  category_distribution,
  charts,
  selectedYear,
  availableYears,
}: MerchandiserDashboardSectionProps) => {
  useRealtimeReload("prices", ".price.modified", [
    "recent_price_changes",
    "action_items",
    "charts",
  ])
  useRealtimeReload("orders", ".order.modified", [
    "charts",
    "kpis",
    "action_items",
  ])
  useRealtimeReload("payments", ".payment.modified", ["charts"])
  useRealtimeReload("stocks", ".stock.modified", [
    "category_distribution",
    "action_items",
  ])
  useRealtimeReload("items", ".item.modified", ["action_items"])
  useRealtimeReload("items", ".item.created", ["action_items"])

  const handleYearChange = (year: string) => {
    router.get(
      PAGE_ROUTES.DASHBOARD_PAGE,
      { year },
      {
        preserveState: true,
        preserveScroll: true,
        only: ["charts", "selected_year"],
      },
    )
  }
  const stockData = category_distribution

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Vouchers"
          value={(kpis?.active_vouchers ?? 0).toString()}
          icon={Ticket}
          label="Currently redeemable"
        />
        <KpiCard
          title="Total Redeemed"
          value={(kpis?.vouchers_redeemed_total ?? 0).toString()}
          icon={Tag}
          label="Lifetime voucher usage"
        />
        <KpiCard
          title="Unpriced Items"
          value={action_items.unpriced_items.length.toString()}
          icon={AlertCircle}
          label="Items with stock but no price"
          trend={
            action_items.unpriced_items.length > 0 ? "negative" : "positive"
          }
        />
        <KpiCard
          title="Slow Moving"
          value={action_items.slow_moving_stock.length.toString()}
          icon={FileWarning}
          label="Items to review for discount"
          trend="negative"
        />
      </div>

      <div className="grid gap-4 sm:gap-4 lg:grid-cols-12 auto-rows-fr">
        <div className="lg:col-span-8 h-90">
          <TotalRevenue
            data={charts.monthly_sales}
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={handleYearChange}
          />
        </div>

        <div className="lg:col-span-4 h-90">
          <ActionNeeded unpricedItems={action_items.unpriced_items} />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-4 lg:grid-cols-12 auto-rows-fr">
        <div className="lg:col-span-4 h-80">
          <CategoryDistribution data={stockData} />
        </div>

        <div className="lg:col-span-4 h-80">
          <TopCustomer data={charts.customer_sales} />
        </div>

        <div className="lg:col-span-4 h-80">
          <RecentPriceUpdates recentPriceChanges={recent_price_changes} />
        </div>
      </div>
    </div>
  )
}
