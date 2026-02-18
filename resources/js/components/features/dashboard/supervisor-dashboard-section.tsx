import { router } from "@inertiajs/react"
import { Package, PhilippinePeso, ShoppingCart, Users } from "lucide-react"
import { PAGE_ROUTES } from "@/config/page-routes"
import { formatCurrency } from "@/lib/format"
import { CategoryDistribution } from "./category-distribution"
import { KpiCard } from "./kpi-card"
import { MonthlySalesSummary } from "./monthly-sales-summary"
import { TopCustomer } from "./top-customer"
import { TopSellingProducts } from "./top-selling-products"
import { TotalRevenue } from "./total-revenue"

interface SupervisorDashboardProps {
  data: {
    monthly_sales: Array<{ month: string; total: number }>
    category_distribution: Array<{ name: string; value: number }>
    sales_percentage: Array<{
      description: string
      sku: string
      total_qty: number
      order_frequency: number
    }>
    customer_segmentation: Array<{
      type: string
      total_sales: number
      transaction_count: number
    }>
    monthly_sales_summary: Array<{
      month: string
      cash_sales: number
      credit_sales: number
      total: number
    }>
  }
  year: string
  availableYears?: string[]
}

export function SupervisorDashboardSection({
  data,
  year,
  availableYears,
}: SupervisorDashboardProps) {
  const totalRevenue = data.monthly_sales.reduce(
    (acc, curr) => acc + curr.total,
    0,
  )
  const totalTransactions = data.customer_segmentation.reduce(
    (acc, curr) => acc + curr.transaction_count,
    0,
  )
  const topCategory =
    data.category_distribution.length > 0
      ? data.category_distribution[0].name
      : "N/A"
  const topSegment =
    data.customer_segmentation.sort((a, b) => b.total_sales - a.total_sales)[0]
      ?.type ?? "N/A"

  const handleYearChange = (newYear: string) => {
    router.get(
      PAGE_ROUTES.DASHBOARD_PAGE,
      { year: newYear },
      {
        preserveState: true,
        preserveScroll: true,
        only: ["supervisor_charts", "selected_year"],
      },
    )
  }

  const categoryData = data.category_distribution.map((item) => ({
    name: item.name,
    total: item.value,
  }))

  const topSellingData = data.sales_percentage.map((item) => ({
    description: item.description,
    total: item.total_qty,
  }))

  const customerData = data.customer_segmentation.map((item) => ({
    name: item.type,
    total: item.total_sales,
  }))

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={`Total Revenue (${year})`}
          icon={PhilippinePeso}
          value={formatCurrency(totalRevenue)}
          label="Year to date performance"
          trend="positive"
        />
        <KpiCard
          title="Total Transactions"
          icon={ShoppingCart}
          value={totalTransactions.toString()}
          label="Completed orders"
        />
        <KpiCard
          title="Top Category"
          icon={Package}
          value={topCategory}
          label="Highest revenue contributor"
        />
        <KpiCard
          title="Top Customer Segment"
          icon={Users}
          value={topSegment}
          label="Based on sales volume"
        />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 auto-rows-[200px]">
        <div className="md:col-span-2 lg:col-span-7 lg:row-span-2">
          <TotalRevenue
            data={data.monthly_sales}
            selectedYear={year}
            availableYears={availableYears}
            onYearChange={handleYearChange}
          />
        </div>
        <div className="md:col-span-1 lg:col-span-5 lg:row-span-2">
          <CategoryDistribution data={categoryData} />
        </div>
        <div className="md:col-span-2 lg:col-span-12 lg:row-span-2">
          <MonthlySalesSummary data={data.monthly_sales_summary} />
        </div>
        <div className="md:col-span-2 lg:col-span-7 lg:row-span-2 h-80">
          <TopSellingProducts data={topSellingData} />
        </div>
        <div className="md:col-span-2 lg:col-span-5 lg:row-span-2 h-80">
          <TopCustomer data={customerData} />
        </div>
      </div>
    </div>
  )
}
