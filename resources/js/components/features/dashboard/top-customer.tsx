import { UsersIcon } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts"
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
  ChartTooltipContent,
} from "@/components/ui/common/chart"
import { CHART_COLORS } from "@/config/chart-colors"
import { formatCurrency } from "@/lib/format"

interface TopCustomerProps {
  data: { name: string; total: number }[]
}

export const TopCustomer = ({ data }: TopCustomerProps) => {
  const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0)
  const isEmpty = data.length === 0 || totalRevenue === 0

  const chartConfig = {
    total: { label: "Revenue" },
    ...data.reduce((acc, curr, index) => {
      acc[curr.name] = {
        label: curr.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
      return acc
    }, {} as ChartConfig),
  } satisfies ChartConfig

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative flex flex-col h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <UsersIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Top Customers
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Highest revenue contributors
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-linear-to-r from-[#349083] to-[#2a7569] bg-clip-text text-transparent">
                {formatCurrency(totalRevenue)}
              </span>
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-medium">
                Total Revenue
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 sm:p-6 min-h-50">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <UsersIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No customer data
              </p>
              <p className="text-xs text-muted-foreground/70 text-center max-w-48">
                Customer revenue data will appear here once sales are recorded
              </p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart
                accessibilityLayer
                data={data}
                layout="vertical"
                margin={{
                  left: 10,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  {data.map((_entry, index) => {
                    const color = CHART_COLORS[index % CHART_COLORS.length]
                    return (
                      <linearGradient
                        key={`gradient-customer-${index}`}
                        id={`gradient-customer-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                    )
                  })}
                </defs>
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
                  className="text-xs font-medium fill-muted-foreground"
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      className="font-mono text-xs"
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  barSize={24}
                  shape={(props: any) => {
                    const index = props.index
                    return (
                      <Rectangle
                        {...props}
                        radius={4}
                        fill={`url(#gradient-customer-${index})`}
                      />
                    )
                  }}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
