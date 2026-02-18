import { router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { CreditCard, PhilippinePeso, TrendingUp, Users } from "lucide-react"
import { PAGE_ROUTES } from "@/config/page-routes"
import { containerFadeIn, itemFadeIn } from "@/lib/animation-variants"
import { formatCurrency } from "@/lib/format"
import { CategoryDistribution } from "./category-distribution"
import { KpiCard } from "./kpi-card"
import { MonthlySalesSummary } from "./monthly-sales-summary"
import { TopCustomer } from "./top-customer"
import { TopSellingProducts } from "./top-selling-products"
import { TotalRevenue } from "./total-revenue"

interface EVPDashboardProps {
  data: {
    executive_summary: {
      kpis: {
        total_revenue: number
        average_order_value: number
        total_credit_outstanding: number
        active_customers: number
      }
      charts: {
        sales_performance: Array<{ month: string; total: number }>
        category_distribution: {
          name: string
          total: number | string
          unit: string
        }[]
        customer_segmentation: Array<{
          type: string
          total_sales: number
          transaction_count: number
        }>
        credit_rating_distribution: Array<{
          stars: number
          label: string
          count: number
        }>
        top_performing_items: Array<{
          description: string
          total_qty: number
        }>
        monthly_sales_summary: Array<{
          month: string
          cash_sales: number
          credit_sales: number
          total: number
        }>
        sales_percentage: Array<{
          description: string
          sku: string
          total_qty: number
          order_frequency: number
        }>
      }
      risk_management: {
        at_risk_customers: Array<{
          name: string
          rating: number
          balance: number
          utilization: number
        }>
        credit_exposure: {
          total_limit: number
          total_balance: number
          exposure_percentage: number
        }
      }
    }
    selected_year: string
    available_years: string[]
  }
}

export const EVPDashboardSection = ({ data }: EVPDashboardProps) => {
  const { kpis, charts, risk_management } = data.executive_summary

  const handleYearChange = (newYear: string) => {
    router.get(
      PAGE_ROUTES.DASHBOARD_PAGE,
      { year: newYear },
      {
        preserveState: true,
        preserveScroll: true,
        only: ["executive_summary", "selected_year", "available_years"],
      },
    )
  }

  const topSellingData = (charts.sales_percentage || []).map((item) => ({
    description: item.description,
    total: item.total_qty,
  }))

  const customerData = charts.customer_segmentation.map((item) => ({
    name: item.type,
    total: item.total_sales,
  }))

  return (
    <motion.div
      variants={containerFadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemFadeIn}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          title="Total Revenue"
          icon={PhilippinePeso}
          value={formatCurrency(kpis.total_revenue)}
          label="Year to Date"
          trend="positive"
        />
        <KpiCard
          title="Avg. Order Value"
          icon={TrendingUp}
          value={formatCurrency(kpis.average_order_value)}
          label="Per Transaction"
        />
        <KpiCard
          title="Outstanding Credit"
          icon={CreditCard}
          value={formatCurrency(kpis.total_credit_outstanding)}
          label={`Exposure: ${risk_management.credit_exposure.exposure_percentage}%`}
          trend={
            risk_management.credit_exposure.exposure_percentage > 50
              ? "negative"
              : "positive"
          }
        />
        <KpiCard
          title="Active Customers"
          icon={Users}
          value={kpis.active_customers.toString()}
          label="Total Customer Base"
        />
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-100">
        <motion.div
          variants={itemFadeIn}
          className="col-span-4 lg:col-span-7 h-100"
        >
          <TotalRevenue
            data={charts.sales_performance}
            selectedYear={data.selected_year}
            availableYears={data.available_years}
            onYearChange={handleYearChange}
          />
        </motion.div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[200px]">
        <div className="md:col-span-1 lg:col-span-5 lg:row-span-2">
          <CategoryDistribution data={charts.category_distribution} />
        </div>
        <div className="md:col-span-2 lg:col-span-7 lg:row-span-2">
          <MonthlySalesSummary data={charts.monthly_sales_summary} />
        </div>
        <div className="md:col-span-2 lg:col-span-7 lg:row-span-2 h-100">
          <TopSellingProducts data={topSellingData} />
        </div>
        <div className="md:col-span-2 lg:col-span-5 lg:row-span-2 h-100">
          <TopCustomer data={customerData} />
        </div>
      </div>
    </motion.div>
  )
}
