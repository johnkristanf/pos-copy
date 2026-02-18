import { motion } from "framer-motion"
import { CreditCard, PhilippinePeso, ShoppingCart, Users } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { CategoryDistribution } from "./category-distribution"
import { KpiCard } from "./kpi-card"
import { RecentPriceUpdates } from "./recent-price-updates"
import { TopCustomer } from "./top-customer"
import { TopSellingProducts } from "./top-selling-products"
import { TotalRevenue } from "./total-revenue"

interface PurchasingSalesHeadData {
  kpis: {
    total_revenue: number
    revenue_growth_percentage: number
    total_orders: number
    active_customers: number
    avg_order_value: number
  }
  charts: {
    monthly_sales: Array<{ month: string; total: number }>
    category_distribution: Array<{ name: string; value: number }>
    customer_segmentation: Array<{
      type: string
      total_sales: number
      transaction_count: number
    }>
    top_products: Array<{
      description: string
      sku: string
      total_qty: number
      order_frequency: number
    }>
  }
  price_analysis: Array<{
    item_name: string
    category: string
    old_price: number
    new_price: number
    user: string
    date: string
    is_increase: boolean
  }>
  selected_year: string
  available_years: string[]
}

interface Props {
  data: PurchasingSalesHeadData
}

export const PurchasingSalesHeadDashboardSection = ({ data }: Props) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const recentPriceUpdatesFormatted = data.price_analysis.map((p) => ({
    item: p.item_name,
    sku: p.category,
    old_price: p.old_price,
    new_price: p.new_price,
    changed_at: p.date,
  }))

  const topProductsFormatted = data.charts.top_products.map((p) => ({
    description: p.description,
    total: p.total_qty,
  }))

  const categoryDistributionFormatted = data.charts.category_distribution.map(
    (c) => ({
      name: c.name,
      total: c.value,
    }),
  )

  const customerSegmentationFormatted = data.charts.customer_segmentation.map(
    (c) => ({
      name: c.type,
      total: c.total_sales,
    }),
  )

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 p-2 md:p-6 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={item}>
          <KpiCard
            title="Total Revenue"
            icon={PhilippinePeso}
            value={formatCurrency(data.kpis.total_revenue)}
            label="Year to Date"
            trend={
              data.kpis.revenue_growth_percentage >= 0 ? "positive" : "negative"
            }
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Active Customers"
            icon={Users}
            value={data.kpis.active_customers.toString()}
            label="Purchasing Customers"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Total Orders"
            icon={ShoppingCart}
            value={data.kpis.total_orders.toString()}
            label="Completed Transactions"
          />
        </motion.div>
        <motion.div variants={item}>
          <KpiCard
            title="Avg. Order Value"
            icon={CreditCard}
            value={formatCurrency(data.kpis.avg_order_value)}
            label="Per Transaction"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 h-100">
          <TotalRevenue data={data.charts.monthly_sales} />
        </motion.div>
        <motion.div variants={item} className="h-100">
          <TopCustomer data={customerSegmentationFormatted} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="h-80">
          <CategoryDistribution data={categoryDistributionFormatted} />
        </motion.div>
        <motion.div variants={item} className="h-80">
          <TopSellingProducts data={topProductsFormatted} />
        </motion.div>
        <motion.div variants={item} className="h-80">
          <RecentPriceUpdates
            recentPriceChanges={recentPriceUpdatesFormatted}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
