import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
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
import { DetailedCustomer } from "@/types"

interface CreditRatingProps {
  customer: DetailedCustomer
}

export function CreditRating({ customer }: CreditRatingProps) {
  const creditScore = customer.credit?.rating || 0
  const creditTerm = customer.credit?.term || 0

  const chartData = [
    { month: "Jan", score: 72 },
    { month: "Feb", score: 73 },
    { month: "Mar", score: 75 },
    { month: "Apr", score: 78 },
    { month: "May", score: 79 },
    { month: "Jun", score: 80 },
    { month: "Jul", score: 81 },
    { month: "Aug", score: 80 },
    { month: "Sep", score: 80 },
    { month: "Oct", score: 81 },
    { month: "Nov", score: 82 },
    { month: "Dec", score: 83 },
  ]

  const chartConfig = {
    score: {
      label: "Credit Score",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-0 pb-2 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            This Customer's Credit Rating is
          </span>
          <Select defaultValue="2_years">
            <SelectTrigger
              className="h-7 w-25 text-xs bg-background"
              aria-label="Select Period"
            >
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_year">1 Year</SelectItem>
              <SelectItem value="2_years">2 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1 mb-6">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Score
          </span>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-bold leading-none tracking-tight">
              {creditScore > 0 ? creditScore : "N/A"}
            </h2>
            <div className="flex items-center gap-1.5 mb-1">
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/25 border-0 shadow-none rounded-full px-2.5">
                Excellent
              </Badge>
              <Badge
                variant="outline"
                className="text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900 rounded-full flex items-center gap-0.5 px-2"
              >
                <TrendingUp className="w-3 h-3" />
                5.2%
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-45 w-full -mx-2">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillScore" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#349083" stopOpacity={1} />
                  <stop offset="100%" stopColor="#e3ea4e" stopOpacity={1} />
                </linearGradient>
                <linearGradient
                  id="fillScoreOpacity"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#349083" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#e3ea4e" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                style={{ fontSize: "0.7rem" }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="score"
                type="natural"
                fill="url(#fillScoreOpacity)"
                fillOpacity={1}
                stroke="url(#fillScore)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#349083",
                  strokeWidth: 0,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="grid gap-3 pt-4 mt-2 border-t border-dashed">
          <div className="flex justify-between py-1">
            <span className="text-sm text-muted-foreground">Credit Term</span>
            <span className="text-sm font-medium">{creditTerm} Days</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-sm text-muted-foreground">Customer ID</span>
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/80">
              {customer.id}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
