import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/common/chart"
import { ChartSkeleton } from "@/components/ui/fallbacks/chart-skeleton"

export interface ProfitableItem {
  description: string
  total_revenue: number
}

interface TopProfitableItemsChartProps {
  data: ProfitableItem[]
  isLoading: boolean
}

export default function TopProfitableItemsChart({
  data: chartData,
  isLoading,
}: TopProfitableItemsChartProps) {
  const totalRevenue = chartData.reduce(
    (sum, item) => sum + item.total_revenue,
    0,
  )
  const itemsCount = chartData.length

  const revenueTarget = 100000
  const itemsAboveTarget = chartData.filter(
    (item) => item.total_revenue >= revenueTarget,
  ).length
  const itemsBelowTarget = itemsCount - itemsAboveTarget

  const chartConfig = {
    total_revenue: {
      label: "Revenue (₱)",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Top 10 Most Profitable Items
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold leading-none tracking-tight">
                ₱ {(totalRevenue / 1000).toFixed(0)}k
              </h2>
              <div className="flex items-center gap-1.5 mb-1">
                {itemsCount === 0 ? (
                  <Badge variant="outline">No Data</Badge>
                ) : itemsBelowTarget === 0 ? (
                  <Badge variant="high">All High Performers</Badge>
                ) : itemsAboveTarget >= 7 ? (
                  <>
                    <Badge variant="strong">Strong</Badge>
                    <Badge variant="outlined_strong">
                      <TrendingUp className="w-3 h-3" />
                      {itemsAboveTarget} above target
                    </Badge>
                  </>
                ) : itemsAboveTarget >= 4 ? (
                  <>
                    <Badge variant="moderate">Moderate</Badge>
                    <Badge variant="outlined_moderate">
                      <TrendingUp className="w-3 h-3" />
                      {itemsAboveTarget} above target
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="low">Needs Boost</Badge>
                    <Badge variant="outlined_low">
                      <TrendingDown className="w-3 h-3" />
                      {itemsBelowTarget} below target
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-80 w-full -mx-2">
            {itemsCount > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0.1%"
                        stopColor="#349083"
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="90%"
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
                    dataKey="description"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    style={{ fontSize: "0.7rem" }}
                    tickFormatter={(value) => {
                      const maxLength = 5
                      return value.length > maxLength
                        ? `${value.substring(0, maxLength)}...`
                        : value
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                    style={{ fontSize: "0.7rem" }}
                  />
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    content={<ChartTooltipContent />}
                  />

                  <Bar
                    dataKey="total_revenue"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                No revenue data available for this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
