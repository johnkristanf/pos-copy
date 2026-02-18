import { Calendar, TrendingUpIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { formatCurrency } from "@/lib/format"

const chartConfig = {
  total: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface TotalRevenueProps {
  data: { month: string; total: number }[]
  selectedYear?: string
  onYearChange?: (year: string) => void
  availableYears?: string[]
}

const formatAxisValue = (value: number): string => {
  const absValue = Math.abs(value)

  if (absValue >= 1e15) {
    return `₱${(value / 1e15).toFixed(1)}Q`
  } else if (absValue >= 1e12) {
    return `₱${(value / 1e12).toFixed(1)}T`
  } else if (absValue >= 1e9) {
    return `₱${(value / 1e9).toFixed(1)}B`
  } else if (absValue >= 1e6) {
    return `₱${(value / 1e6).toFixed(1)}M`
  } else if (absValue >= 1e3) {
    return `₱${(value / 1e3).toFixed(0)}k`
  } else {
    return `₱${value.toFixed(0)}`
  }
}

export const TotalRevenue = ({
  data,
  selectedYear = new Date().getFullYear().toString(),
  onYearChange,
  availableYears = [new Date().getFullYear().toString()],
}: TotalRevenueProps) => {
  const totalSales = data.reduce((acc, curr) => acc + curr.total, 0)
  const isEmpty = data.length === 0 || totalSales === 0

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm shrink-0">
                  <TrendingUpIcon className="h-3.5 w-3.5 text-white" />
                </div>

                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest truncate">
                  Total Revenue
                </CardTitle>
              </div>

              <div className="flex items-center justify-between gap-4">
                <CardDescription className="text-[10px] sm:text-[11px] text-muted-foreground/70 leading-relaxed">
                  Total sales performance for{" "}
                  <span className="font-semibold text-foreground">
                    {selectedYear}
                  </span>
                </CardDescription>

                <div className="-mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight font-mono break-all text-[#349083]">
                  {formatCurrency(totalSales)}
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2 shrink-0">
              <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="w-24 sm:w-27.5 h-8 sm:h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <Calendar className="size-3 sm:h-3.5 sm:w-3.5" />

                    <SelectValue placeholder="Year" className="text-xs" />
                  </div>
                </SelectTrigger>

                <SelectContent align="end">
                  {availableYears.map((year) => (
                    <SelectItem
                      key={year}
                      value={year}
                      className="font-mono text-xs"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 pt-4 sm:pt-6 px-2 sm:px-4 pb-2 sm:pb-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full min-h-40 sm:min-h-50 -mt-5">
              <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4">
                <TrendingUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                No revenue data
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center max-w-40 sm:max-w-48 px-2">
                Revenue trends will appear here once sales are recorded for{" "}
                {selectedYear}
              </p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-full w-full max-h-60 sm:max-h-80 lg:max-h-100"
            >
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 5,
                  bottom: 0,
                }}
                className="sm:ml-0"
              >
                <defs>
                  <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#349083" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#2a7569" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e3ea4e" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="strokeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#349083" />
                    <stop offset="50%" stopColor="#2a7569" />
                    <stop offset="100%" stopColor="#e3ea4e" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value.slice(0, 3)}
                  className="text-[8px] sm:text-[10px] uppercase font-semibold"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", opacity: 0.7 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={50}
                  tickCount={5}
                  tickFormatter={formatAxisValue}
                  className="text-[8px] sm:text-[10px] font-mono font-semibold"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", opacity: 0.7 }}
                />
                <ChartTooltip
                  cursor={{
                    stroke: "#349083",
                    strokeWidth: 2,
                    strokeDasharray: "4 4",
                    opacity: 0.3,
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      className="font-mono text-[10px] sm:text-xs shadow-lg"
                    />
                  }
                />
                <Area
                  dataKey="total"
                  type="monotone"
                  fill="url(#fillTotal)"
                  fillOpacity={1}
                  stroke="url(#strokeGradient)"
                  strokeWidth={2}
                  className="sm:stroke-3"
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#349083",
                    fill: "#ffffff",
                    className: "drop-shadow-lg sm:r-6",
                  }}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
