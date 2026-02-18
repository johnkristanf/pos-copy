import { Shield, TrendingDown, TrendingUp, Users } from "lucide-react"
import { Cell, Label, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/common/chart"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { cn } from "@/lib/cn"

interface CreditRiskDistributionProps {
  data: Array<{
    stars: number
    label: string
    count: number
  }>
}

const chartConfig = {
  count: {
    label: "Count",
  },
  excellent: {
    label: "Excellent",
    color: "#10B981", // Emerald
  },
  good: {
    label: "Good",
    color: "#349083", // Teal
  },
  fair: {
    label: "Fair",
    color: "#F59E0B", // Amber
  },
  risk: {
    label: "At Risk",
    color: "#EF4444", // Red
  },
} satisfies ChartConfig

export const CreditRiskDistribution = ({
  data,
}: CreditRiskDistributionProps) => {
  const ratingData = data.map((item) => ({
    ...item,
    fill:
      item.stars === 5
        ? chartConfig.excellent.color
        : item.stars === 4
          ? chartConfig.good.color
          : item.stars === 3
            ? chartConfig.fair.color
            : chartConfig.risk.color,
  }))

  const totalCustomers = data.reduce((acc, item) => acc + item.count, 0)
  const healthyCustomers = data
    .filter((item) => item.stars >= 4)
    .reduce((acc, item) => acc + item.count, 0)
  const atRiskCustomers = data
    .filter((item) => item.stars <= 2)
    .reduce((acc, item) => acc + item.count, 0)
  const healthyPercentage =
    totalCustomers > 0
      ? ((healthyCustomers / totalCustomers) * 100).toFixed(0)
      : "0"
  const atRiskPercentage =
    totalCustomers > 0
      ? ((atRiskCustomers / totalCustomers) * 100).toFixed(0)
      : "0"

  const isEmpty = totalCustomers === 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = ((item.count / totalCustomers) * 100).toFixed(1)

      return (
        <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-xl z-50">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <p className="text-xs font-semibold text-foreground">
              {item.label}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Customers</span>
              <span className="text-xs font-bold text-foreground">
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">% of Total</span>
              <span className="text-xs font-bold" style={{ color: item.fill }}>
                {percentage}%
              </span>
            </div>
            <div className="flex items-center gap-0.5 pt-1">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <span
                  key={starIndex}
                  className={cn(
                    "text-sm",
                    starIndex < item.stars
                      ? "text-yellow-500"
                      : "text-zinc-300 dark:text-zinc-700",
                  )}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="group relative rounded-xl transition-all duration-300 hover:shadow-lg h-full">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10 h-full">
        <CardHeader className="border-b border-border/40 pb-2 sm:pb-3 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <CardTitle className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
                    Credit Rating Distribution
                  </CardTitle>
                </div>
                <CardDescription className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  Customer base by risk profile
                </CardDescription>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border border-[#349083]/20">
                <p className="text-[9px] font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-xs font-bold text-foreground">
                  {totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>

            {!isEmpty && (
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                  <TrendingUp className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium text-emerald-700 dark:text-emerald-400">
                      Healthy
                    </p>
                    <div className="flex items-baseline gap-0.5">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {healthyCustomers}
                      </p>
                      <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70">
                        ({healthyPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                  <TrendingDown className="size-3 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium text-red-700 dark:text-red-400">
                      At Risk
                    </p>
                    <div className="flex items-baseline gap-0.5">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400">
                        {atRiskCustomers}
                      </p>
                      <p className="text-[9px] text-red-600/70 dark:text-red-400/70">
                        ({atRiskPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <CardContent className="h-full p-3 sm:p-4">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full min-h-62.5 py-8 px-4">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-linear-to-r from-[#349083]/20 to-[#e3ea4e]/20 rounded-full blur-xl" />
                  <div className="relative p-4 rounded-full bg-muted/50 border border-border/50">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No Customer Data
                </h3>
                <p className="text-xs text-muted-foreground text-center max-w-62.5">
                  Credit rating distribution will appear here once customer data
                  is available.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-70">
                  {[
                    { label: "Excellent", color: chartConfig.excellent.color },
                    { label: "Good", color: chartConfig.good.color },
                    { label: "Fair", color: chartConfig.fair.color },
                    { label: "At Risk", color: chartConfig.risk.color },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/30 border border-border/50"
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4 h-full">
                <div className="flex flex-col gap-2 shrink-0">
                  {ratingData.map((item, index) => {
                    const percentage = (
                      (item.count / totalCustomers) *
                      100
                    ).toFixed(0)
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 min-w-0"
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <div className="flex flex-col min-w-0">
                          <p className="text-[9px] sm:text-[10px] font-medium truncate">
                            {item.label}
                          </p>
                          <div className="flex items-baseline gap-0.5">
                            <p className="text-[10px] sm:text-xs font-bold">
                              {item.count}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              ({percentage}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex-1 flex items-center justify-center min-w-0">
                  <ChartContainer
                    config={chartConfig}
                    className="w-full max-w-50 sm:max-w-60 aspect-square"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<CustomTooltip />}
                      />
                      <Pie
                        data={ratingData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius="55%"
                        outerRadius="80%"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 16}
                                    className="fill-muted-foreground text-xs font-medium"
                                  >
                                    Total
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 4}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {totalCustomers}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 20}
                                    className="fill-muted-foreground text-[10px]"
                                  >
                                    Customers
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                        {ratingData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="hover:opacity-80 transition-opacity cursor-pointer stroke-background dark:stroke-zinc-950"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}
