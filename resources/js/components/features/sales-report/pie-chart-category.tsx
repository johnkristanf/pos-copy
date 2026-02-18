import { useMemo } from "react"
import { Pie, PieChart, Tooltip } from "recharts"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { ChartConfig, ChartContainer } from "@/components/ui/common/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { CHART_COLORS } from "@/config/chart-colors"
import { ItemCategorySales } from "@/types"

interface SalesCategoryBreakdownProps {
  itemCategorySales: ItemCategorySales[]
  currentFilter: string | null
  onFilterChange: (value: string) => void
}

export default function SalesCategoryBreakdown({
  itemCategorySales = [],
  currentFilter,
  onFilterChange,
}: SalesCategoryBreakdownProps) {
  const chartData = useMemo(() => {
    if (!itemCategorySales) return []

    const validData = itemCategorySales.filter((item) => item != null)

    const sortedData = [...validData].sort(
      (a: any, b: any) => (b.total_amount || 0) - (a.total_amount || 0),
    )

    return sortedData.map((item: any, index) => ({
      name: item.category_name || item.customer_name || "Unknown Category",
      value: Number(item.total_amount || 0),
      fill: CHART_COLORS[index % CHART_COLORS.length],
      id: item.category_id || item.customer_id || index,
    }))
  }, [itemCategorySales])

  const totalSales = chartData.reduce((sum, item) => sum + item.value, 0)
  const topCategory = chartData[0] || null

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      sales: { label: "Sales" },
    }
    chartData.forEach((item) => {
      const key = item.name.replace(/\s+/g, "").toLowerCase()
      config[key] = {
        label: item.name,
        color: item.fill,
      }
    })
    return config
  }, [chartData])

  const selectCategoryFilter = [
    { id: 1, code: "net_credit_sales", name: "Net Sales" },
    { id: 2, code: "credit_sales", name: "Credit Sales" },
    { id: 3, code: "sales_returns", name: "Sales Return" },
  ]

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percentage =
        totalSales > 0 ? ((data.value / totalSales) * 100).toFixed(1) : "0.0"

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₱{data.value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const hasData = chartData.length > 0

  return (
    <Card className="overflow-hidden min-w-[50%]">
      <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Sales by Category
            </span>
          </div>
          <Select
            value={currentFilter || "Net Sales"}
            onValueChange={onFilterChange}
          >
            <SelectTrigger className="w-30">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Net</SelectLabel>
                {selectCategoryFilter?.map((a) => (
                  <SelectItem key={a.id} value={a.code}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {hasData ? (
          <>
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sales Across Categories
              </span>
              <div className="flex items-end gap-2">
                <h2 className="text-4xl font-bold leading-none tracking-tight">
                  ₱{(totalSales / 1000).toFixed(1)}k
                </h2>
                {topCategory && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/25 border-0 shadow-none rounded-full px-2.5">
                      Top: {topCategory.name}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900 rounded-full px-2"
                    >
                      {((topCategory.value / totalSales) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="h-80 w-full flex items-center justify-center">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <PieChart>
                  <Tooltip content={renderCustomTooltip} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  />
                </PieChart>
              </ChartContainer>
            </div>

            <div className="grid gap-3 pt-4 mt-2 border-t border-dashed">
              {chartData.map((category, index) => (
                <div
                  key={category.id || index}
                  className="flex justify-between items-center py-1"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      ₱{category.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground min-w-12 text-right">
                      {totalSales > 0
                        ? ((category.value / totalSales) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
            No sales data available.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
