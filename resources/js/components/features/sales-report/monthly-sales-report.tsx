import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/common/chart"
import { TotalSales } from "@/types"

interface MonthlySalesReportProps {
  totalSales: TotalSales
}

export default function MonthlySalesReport({
  totalSales,
}: MonthlySalesReportProps) {
  const monthsData = totalSales?.months || []

  const chartData = monthsData.map((m) => ({
    month: `${m.month.substring(0, 3)} '${m.year.slice(-2)}`,
    sales: m.total,
    fullYear: m.year,
  }))

  const currentTotal = totalSales?.total || 0
  const avgSales = totalSales?.average_monthly_sales || 0
  const highestMonth = totalSales?.highest_month

  const firstMonthSales = chartData[0]?.sales || 0
  const lastMonthSales = chartData[chartData.length - 1]?.sales || 0

  const growthRate =
    firstMonthSales > 0
      ? (((lastMonthSales - firstMonthSales) / firstMonthSales) * 100).toFixed(
          1,
        )
      : "0.0"

  const isPositiveGrowth = parseFloat(growthRate) >= 0

  const dateRangeLabel =
    chartData.length > 0
      ? `${chartData[0].month} - ${chartData[chartData.length - 1].month}`
      : "No Data"

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <div className="">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Monthly Sales Report
            </span>
            <Badge variant="outline" className="text-xs">
              {dateRangeLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Sales ({chartData.length} Months)
            </span>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold leading-none tracking-tight">
                ₱{(currentTotal / 1000).toFixed(1)}k
              </h2>
              {chartData.length > 1 && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/25 border-0 shadow-none rounded-full px-2.5">
                    {isPositiveGrowth ? "Strong Growth" : "Declining"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-900 rounded-full flex items-center gap-0.5 px-2 ${
                      isPositiveGrowth
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-700 border-red-200 bg-red-50 dark:text-red-400"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 ${!isPositiveGrowth && "rotate-180"}`}
                    />
                    {growthRate}%
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="h-64 w-full -mx-2">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#349083" stopOpacity={1} />
                      <stop offset="100%" stopColor="#e3ea4e" stopOpacity={1} />
                    </linearGradient>
                    <linearGradient
                      id="fillSalesOpacity"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#349083" stopOpacity={0.4} />
                      <stop
                        offset="100%"
                        stopColor="#e3ea4e"
                        stopOpacity={0.4}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    style={{ fontSize: "0.7rem" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        formatter={(value) => (
                          <div className="flex min-w-25 items-center text-xs text-muted-foreground">
                            Sales
                            <span className="ml-auto font-mono font-medium text-foreground">
                              ₱{Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Area
                    dataKey="sales"
                    type="natural"
                    fill="url(#fillSalesOpacity)"
                    fillOpacity={1}
                    stroke="url(#fillSales)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#349083",
                      strokeWidth: 0,
                    }}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No sales data available
              </div>
            )}
          </div>

          <div className="grid gap-3 pt-4 mt-2 border-t border-dashed">
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">
                Average Monthly Sales
              </span>
              <span className="text-sm font-medium">
                ₱{avgSales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">
                Highest Month
              </span>
              <span className="text-sm font-medium">
                {highestMonth
                  ? `${highestMonth.month.substring(0, 3)} '${highestMonth.year.slice(-2)} - ₱${highestMonth.total.toLocaleString()}`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm text-muted-foreground">
                Growth (Period)
              </span>
              <span
                className={`text-sm font-medium ${isPositiveGrowth ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}
              >
                {growthRate > "0" ? "+" : ""}
                {growthRate}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
