import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/common/chart"
import { AffiliatedCustomer } from "@/types"

interface TopCustomersAffiliatedChartProps {
  totalAffiliatedCustomer: AffiliatedCustomer[]
}

export default function TopCustomersAffiliatedChart({
  totalAffiliatedCustomer = [],
}: TopCustomersAffiliatedChartProps) {
  const chartData = totalAffiliatedCustomer.map((item) => ({
    customer: item.customer_name,
    volume: item.total_volume,
  }))

  const chartConfig = {
    volume: {
      label: "Order Volume",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Top Affiliated Customers
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80 w-full -mx-2">
            {chartData.length > 0 ? (
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
                        offset="100%"
                        stopColor="#e3ea4e"
                        stopOpacity={0.5}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="customer"
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
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex min-w-32.5 items-center text-xs text-muted-foreground">
                            Order Volume
                            <span className="ml-auto font-mono font-medium text-foreground">
                              ₱{Number(value).toLocaleString()}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="volume"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No affiliated customer data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
