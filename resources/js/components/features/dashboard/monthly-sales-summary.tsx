// File: monthly-sales-summary.tsx
import { Banknote, TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { formatCurrency } from "@/lib/format"

interface MonthlySalesSummaryProps {
  data: Array<{
    month: string
    cash_sales: number
    credit_sales: number
    total: number
  }>
}

export const MonthlySalesSummary = ({ data }: MonthlySalesSummaryProps) => {
  const totalCash = data.reduce((acc, curr) => acc + curr.cash_sales, 0)
  const totalCredit = data.reduce((acc, curr) => acc + curr.credit_sales, 0)
  const totalSales = totalCash + totalCredit
  const cashPercentage = ((totalCash / totalSales) * 100).toFixed(1)
  const creditPercentage = ((totalCredit / totalSales) * 100).toFixed(1)

  const peakMonth = data.reduce(
    (max, curr) => (curr.total > max.total ? curr : max),
    data[0],
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0,
      )
      const cashValue =
        payload.find((p: any) => p.dataKey === "cash_sales")?.value || 0
      const creditValue =
        payload.find((p: any) => p.dataKey === "credit_sales")?.value || 0
      const cashPct = ((cashValue / total) * 100).toFixed(0)
      const creditPct = ((creditValue / total) * 100).toFixed(0)

      return (
        <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
          <p className="text-xs font-semibold mb-2 text-foreground">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Cash</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(cashValue)}
                </p>
                <p className="text-[10px] text-muted-foreground">{cashPct}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs text-muted-foreground">Credit</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(creditValue)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {creditPct}%
                </p>
              </div>
            </div>
            <div className="pt-1.5 mt-1.5 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-foreground">
                  Total
                </span>
                <span className="text-xs font-bold text-foreground">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                    <Banknote className="h-3.5 w-3.5 text-white" />
                  </div>
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Monthly Sales Summary
                  </CardTitle>
                </div>
                <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  Cash vs Credit payment breakdown
                </CardDescription>
              </div>

              {peakMonth && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border border-[#349083]/20">
                  <TrendingUp className="h-3 w-3 text-[#349083]" />
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Peak
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {peakMonth.month}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    Cash Sales
                  </span>
                </div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(totalCash)}
                </p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                  {cashPercentage}% of total
                </p>
              </div>

              <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    Credit Sales
                  </span>
                </div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {formatCurrency(totalCredit)}
                </p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                  {creditPercentage}% of total
                </p>
              </div>

              <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Total Revenue
                </span>
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(totalSales)}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  Combined sales
                </p>
              </div>

              <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Monthly Avg
                </span>
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(totalSales / (data.length || 1))}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  Per month
                </p>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Payment Method Distribution</span>
                <span>
                  Cash {cashPercentage}% • Credit {creditPercentage}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${cashPercentage}%` }}
                />
                <div
                  className="h-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${creditPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/30"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "16px",
                }}
                iconType="circle"
                formatter={(value) => {
                  if (value === "cash_sales") return "Cash Sales"
                  if (value === "credit_sales") return "Credit Sales"
                  return value
                }}
              />
              <Bar
                dataKey="cash_sales"
                name="cash_sales"
                fill="url(#cashGradient)"
                radius={[4, 4, 0, 0]}
                stackId="a"
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-cash-${index}`}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
              <Bar
                dataKey="credit_sales"
                name="credit_sales"
                fill="url(#creditGradient)"
                radius={[4, 4, 0, 0]}
                stackId="a"
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-credit-${index}`}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
