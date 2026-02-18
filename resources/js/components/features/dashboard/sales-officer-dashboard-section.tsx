import { motion } from "framer-motion"
import { FileText, ShoppingCart, TrendingUp } from "lucide-react"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeInvalidation } from "@/hooks/api/use-realtime-invalidation"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import { containerFadeIn, itemFadeIn } from "@/lib/animation-variants"
import { formatCurrency } from "@/lib/format"
import { KpiCard } from "./kpi-card"
import { ListOfTransactions, RecentOrder } from "./list-of_transactions"
import { QuickCustomerSearch } from "./quick-customer-search"
import { QuickItemLookUp } from "./quick-item-lookup"

interface DashboardSectionProps {
  stats: {
    total_orders: number
    total_sales: number
    pending_quotations: number
  }
  recentOrders: RecentOrder[]
}

export const SalesOfficerDashboardSection = ({
  stats,
  recentOrders,
}: DashboardSectionProps) => {
  useRealtimeReload("orders", ".order.modified", ["stats", "recent_orders"])
  useRealtimeReload("payments", ".payment.modified", ["stats", "recent_orders"])

  useRealtimeInvalidation("items", ".item.modified", ["dashboard-item-lookup"])
  useRealtimeInvalidation("customers", ".customer.modified", [
    "quick-customer-search",
  ])

  return (
    <motion.div
      variants={containerFadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-2 md:p-6 max-w-400 mx-auto"
    >
      <motion.div
        variants={itemFadeIn}
        className="grid gap-4 grid-cols-1 sm:grid-cols-3"
      >
        <KpiCard
          title="Total Sales"
          icon={TrendingUp}
          value={formatCurrency(stats.total_sales)}
          label="Today's Revenue"
          trend="positive"
        />
        <KpiCard
          title="Transactions"
          icon={ShoppingCart}
          value={stats.total_orders.toString()}
          label="Processed Orders"
        />
        <KpiCard
          title="Pending Quotes"
          icon={FileText}
          value={stats.pending_quotations.toString()}
          label="Drafts Active"
          actionLink={`${PAGE_ROUTES.CREATE_ORDERS_PAGE}?action=open_drafts`}
        />
      </motion.div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 h-full">
        <motion.div
          variants={itemFadeIn}
          className="space-y-6 lg:col-span-4 h-full flex flex-col"
        >
          <QuickItemLookUp />
          <QuickCustomerSearch />
        </motion.div>

        <motion.div variants={itemFadeIn} className="lg:col-span-8 h-full">
          <ListOfTransactions recentOrders={recentOrders} />
        </motion.div>
      </div>
    </motion.div>
  )
}
