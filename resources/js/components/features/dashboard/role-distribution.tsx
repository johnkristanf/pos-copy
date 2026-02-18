import { UsersRound } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { CHART_COLORS } from "@/config/chart-colors"

export interface RoleStat {
  name: string
  count: number
}

interface RoleDistributionChartProps {
  data: RoleStat[]
}

const chartConfig = {
  count: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export const RoleDistribution = ({ data }: RoleDistributionChartProps) => {
  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                <UsersRound className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Workforce Distribution
              </CardTitle>
            </div>
            <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Active users by role
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6">
              <ChartContainer
                config={chartConfig}
                className="min-h-62.5 w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={data}
                  layout="vertical"
                  margin={{ left: 0, right: 0 }}
                >
                  <defs>
                    {CHART_COLORS.map((color, index) => (
                      <linearGradient
                        key={`gradient-${index}`}
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={color} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={120}
                    tickFormatter={(value) => value}
                    className="text-xs font-medium"
                  />
                  <XAxis dataKey="count" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="count"
                    barSize={24}
                    shape={(props: any) => {
                      const index = props.index
                      return (
                        <Rectangle
                          {...props}
                          radius={[0, 4, 4, 0]}
                          fill={`url(#gradient-${index % CHART_COLORS.length})`}
                        />
                      )
                    }}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </ScrollArea>
          <div
            className="absolute bottom-0 left-0 right-0 h-5 pointer-events-none z-20 bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 backdrop-blur-[1px]"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </div>
  )
}
