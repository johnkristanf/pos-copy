import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/common/chart"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { CHART_COLORS } from "@/config/chart-colors"
import { cn } from "@/lib/cn"

interface TopPerformingItemsChartProps {
  data: Array<{
    description: string
    total_qty: number
  }>
  isSuperAdmin?: boolean
}

export const TopPerformingItems = ({
  data,
  isSuperAdmin = false,
}: TopPerformingItemsChartProps) => {
  const topItem = data.length > 0 ? data[0] : null

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload

      return (
        <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-3 shadow-xl">
          <p className="text-xs font-semibold mb-2 text-foreground max-w-50">
            {item.description}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                Quantity Sold
              </span>
              <span className="text-xs font-bold text-foreground">
                {item.total_qty.toLocaleString()}
              </span>
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
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Top Performing Items
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                By sales volume and quantity sold
              </CardDescription>
            </div>

            {topItem && (
              <div className="hidden sm:flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border border-[#349083]/20">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Best Seller
                </p>
                <p className="text-xs font-bold text-foreground max-w-30 truncate">
                  {topItem.description}
                </p>
                <p className="text-[10px] text-[#349083] font-semibold">
                  {topItem.total_qty.toLocaleString()} units
                </p>
              </div>
            )}
          </div>

          {topItem && (
            <div className="sm:hidden flex items-center justify-between gap-2 pt-3 px-3 py-2 rounded-lg bg-linear-to-r from-[#349083]/10 to-[#e3ea4e]/10 border border-[#349083]/20">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground">
                  Best Seller
                </p>
                <p className="text-xs font-bold text-foreground truncate">
                  {topItem.description}
                </p>
              </div>
              <p className="text-xs text-[#349083] font-semibold shrink-0">
                {topItem.total_qty.toLocaleString()} units
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <div className={cn("p-4 sm:p-6", isSuperAdmin && "sm:p-4")}>
              {data.length > 0 ? (
                <ChartContainer
                  config={{}}
                  className={cn(
                    "w-full",
                    isSuperAdmin
                      ? "h-45"
                      : "min-h-75 sm:min-h-87.5 lg:min-h-100",
                  )}
                >
                  <BarChart
                    accessibilityLayer
                    data={data}
                    layout="vertical"
                    margin={{
                      left: 0,
                      right: 10,
                      top: 5,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      {data.map((_entry, index) => {
                        const color = CHART_COLORS[index % CHART_COLORS.length]
                        return (
                          <linearGradient
                            key={`gradient-items-${index}`}
                            id={`gradient-items-${index}`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor={color}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={color}
                              stopOpacity={1}
                            />
                          </linearGradient>
                        )
                      })}
                    </defs>
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                      className="stroke-border/30"
                    />
                    <YAxis
                      dataKey="description"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      width={80}
                      className="text-xs"
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                      }}
                      tickFormatter={(value) => {
                        const maxLength = isSuperAdmin
                          ? 10
                          : window.innerWidth < 640
                            ? 12
                            : 15
                        return value.length > maxLength
                          ? `${value.slice(0, maxLength)}...`
                          : value
                      }}
                    />
                    <XAxis dataKey="total_qty" type="number" hide />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                      content={<CustomTooltip />}
                    />
                    <Bar
                      dataKey="total_qty"
                      radius={[0, 4, 4, 0]}
                      barSize={
                        isSuperAdmin ? 16 : window.innerWidth < 640 ? 20 : 24
                      }
                      shape={(props: any) => {
                        const index = props.index
                        return (
                          <Rectangle
                            {...props}
                            radius={[0, 4, 4, 0]}
                            fill={`url(#gradient-items-${index})`}
                          />
                        )
                      }}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-45 gap-3"
                >
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      No Sales Data
                    </p>
                    <p className="text-xs text-muted-foreground/70 max-w-50">
                      Sales data will appear here once available
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {data.length > 0 && !isSuperAdmin && (
            <div
              className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none z-20 bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 backdrop-blur-[1px]"
              aria-hidden="true"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
