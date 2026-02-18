import { AlertTriangle, PackageX, TrendingDown } from "lucide-react"
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

export interface FastMovingItem {
  id: number
  description: string
  average_order_difference_days: number
}

interface FastMovingItemsChartProps {
  data: FastMovingItem[]
  isLoading: boolean
}

export default function FastMovingItemsChart({
  data: chartData,
  isLoading,
}: FastMovingItemsChartProps) {
  const totalItems = chartData.length
  const avgDaysVal =
    totalItems > 0
      ? chartData.reduce(
          (sum, item) => sum + item.average_order_difference_days,
          0,
        ) / totalItems
      : 0

  const avgDays = avgDaysVal.toFixed(0)

  const criticalThreshold = 7
  const itemsBelowThreshold = chartData.filter(
    (item) => item.average_order_difference_days < criticalThreshold,
  ).length

  const chartConfig = {
    average_order_difference_days: {
      label: "Avg Days Between Orders",
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
              Top Fast-Moving Items
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Average Order Frequency
            </span>
            <div className="flex items-end gap-2">
              <h2 className="text-4xl font-bold leading-none tracking-tight">
                {totalItems > 0 ? `${avgDays} days` : "—"}
              </h2>
              <div className="flex items-center gap-1.5 mb-1">
                {totalItems === 0 ? (
                  <Badge variant="outline">No Data</Badge>
                ) : itemsBelowThreshold === 0 ? (
                  <Badge variant="on_target">Steady Flow</Badge>
                ) : itemsBelowThreshold <= 2 ? (
                  <>
                    <Badge variant="moderate">High Velocity</Badge>
                    <Badge variant="outlined_moderate">
                      <AlertTriangle className="w-3 h-3" />
                      {itemsBelowThreshold} moving fast
                    </Badge>
                  </>
                ) : (
                  <>
                    <Badge variant="low">Restock Warning</Badge>
                    <Badge variant="outlined_low">
                      <TrendingDown className="w-3 h-3" />
                      {itemsBelowThreshold} critical velocity
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="h-80 w-full -mx-2">
            {totalItems > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradientFast"
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
                    tickFormatter={(value) => `${value.toFixed(1)} d`}
                    style={{ fontSize: "0.7rem" }}
                  />

                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                    content={<ChartTooltipContent />}
                  />

                  <Bar
                    dataKey="average_order_difference_days"
                    fill="url(#barGradientFast)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/30 px-6 py-10 transition-all hover:bg-muted/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-sm">
                  <PackageX className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  No fast-moving items found
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground max-w-55 text-center leading-relaxed">
                  There is no sales data available for this period. Try
                  adjusting the date range or filters.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
