import { PackageIcon } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts"
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

interface CategoryDistributionProps {
  data: { name: string; total: number | string }[]
}

export const CategoryDistribution = ({ data }: CategoryDistributionProps) => {
  const totalQuantity = data.reduce((acc, curr) => acc + Number(curr.total), 0)

  const formatQuantity = (num: number) => {
    if (num >= 1.0e15)
      return `${(num / 1.0e15).toFixed(1).replace(/\.0$/, "")}Q`
    if (num >= 1.0e12)
      return `${(num / 1.0e12).toFixed(1).replace(/\.0$/, "")}T`
    if (num >= 1.0e9) return `${(num / 1.0e9).toFixed(1).replace(/\.0$/, "")}B`
    if (num >= 1.0e6) return `${(num / 1.0e6).toFixed(1).replace(/\.0$/, "")}M`
    if (num >= 1.0e3) return `${(num / 1.0e3).toFixed(1).replace(/\.0$/, "")}K`
    return num.toLocaleString()
  }

  const chartConfig = {
    total: { label: "Quantity" },
    ...data.reduce((acc, curr, index) => {
      acc[curr.name] = {
        label: curr.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
      return acc
    }, {} as ChartConfig),
  } satisfies ChartConfig

  const chartData = data
    .map((item, index) => {
      const itemTotal = Number(item.total)
      return {
        ...item,
        total: itemTotal,
        percentage:
          totalQuantity > 0
            ? ((itemTotal / totalQuantity) * 100).toFixed(1)
            : "0",
        fill: `url(#gradient-category-${index % CHART_COLORS.length})`,
        solidFill: CHART_COLORS[index % CHART_COLORS.length],
      }
    })
    .sort((a, b) => a.total - b.total)

  const legendData = [...chartData].reverse()
  const isEmpty = data.length === 0 || totalQuantity === 0

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative flex flex-col h-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <PackageIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Category Distribution
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Product distribution across categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 grid grid-cols-1 sm:grid-cols-5 p-0 min-h-0">
          {isEmpty ? (
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-8 min-h-50">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <PackageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No category data
              </p>
              <p className="text-xs text-muted-foreground/70 text-center max-w-48">
                Category distribution will appear here once products are added
              </p>
            </div>
          ) : (
            <>
              <div className="sm:col-span-3 flex items-center justify-center min-h-50">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-square w-full max-w-48"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={chartData}
                      startAngle={90}
                      endAngle={-270}
                      innerRadius={30}
                      outerRadius={90}
                      barSize={10}
                    >
                      <defs>
                        {CHART_COLORS.map((color, index) => (
                          <linearGradient
                            key={`gradient-category-${index}`}
                            id={`gradient-category-${index}`}
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
                        ))}
                      </defs>
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted/20 last:fill-background"
                      />
                      <RadialBar dataKey="total" background cornerRadius={10} />
                      <PolarRadiusAxis
                        tick={false}
                        tickLine={false}
                        axisLine={false}
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
                                  className="cursor-help"
                                >
                                  <title>
                                    {totalQuantity.toLocaleString()} Units
                                  </title>
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold font-mono tracking-tighter"
                                  >
                                    {formatQuantity(totalQuantity)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 15}
                                    className="fill-muted-foreground text-[10px] font-medium uppercase tracking-widest"
                                  >
                                    Units
                                  </tspan>
                                </text>
                              )
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            className="w-44 font-mono text-xs shadow-lg bg-background/95 backdrop-blur-sm"
                            formatter={(value, name, item) => (
                              <div className="flex flex-col gap-0.5 w-full">
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="font-semibold text-foreground truncate max-w-25"
                                    title={name as string}
                                  >
                                    {name}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {item.payload.percentage}%
                                  </span>
                                </div>
                                <span className="text-[10px] text-muted-foreground/70">
                                  {(value as number).toLocaleString()} units
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-border/40 bg-zinc-50/30 dark:bg-zinc-900/10 overflow-y-auto max-h-60 sm:max-h-full">
                <div className="flex flex-col gap-3 p-4">
                  {legendData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-xs group/item"
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0 ring-1 ring-border/50"
                        style={{ backgroundColor: item.solidFill }}
                      />
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span
                          className="truncate text-muted-foreground group-hover/item:text-foreground transition-colors mr-2"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
