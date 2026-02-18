import { TrophyIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"

interface TopSellingProductsProps {
  data: { description: string; total: number | string }[]
}

export const TopSellingProducts = ({ data }: TopSellingProductsProps) => {
  const maxVal = Math.max(...data.map((d) => Number(d.total)))
  const totalSales = data.reduce((acc, curr) => acc + Number(curr.total), 0)

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <TrophyIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Top Selling Products
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Best performing items by sales volume
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-2xl font-bold tracking-tight bg-linear-to-r from-[#349083] to-[#2a7569] bg-clip-text text-transparent">
                {totalSales.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide font-medium">
                Total Sales
              </span>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-full">
          <CardContent className="flex-1 pt-4 px-0 pb-2">
            {data.length > 0 ? (
              <div className="flex flex-col gap-2 px-4 sm:px-5">
                {data.map((item, i) => {
                  const itemTotal = Number(item.total)
                  const percentage =
                    totalSales > 0
                      ? ((itemTotal / totalSales) * 100).toFixed(1)
                      : "0.0"
                  const barWidth = maxVal > 0 ? (itemTotal / maxVal) * 100 : 0

                  return (
                    <div
                      key={i}
                      className="relative px-2 py-2 rounded-lg bg-linear-to-br from-zinc-50/50 to-transparent dark:from-zinc-900/30 dark:to-transparent border border-border/40 group/row hover:border-[#349083]/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="absolute -top-4 -right-2 flex items-center justify-center h-6 w-6 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 font-bold text-[10px] text-foreground/70 border-2 border-background shadow-sm z-10">
                        {i + 1}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3 relative z-10">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-foreground line-clamp-2 group-hover/row:text-[#349083] transition-colors leading-tight">
                              {item.description}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            <span className="text-sm font-bold text-foreground font-mono">
                              {itemTotal.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#349083] font-bold">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-[#349083] to-[#2a7569] rounded-full transition-all duration-500 ease-out group-hover/row:from-[#2a7569] group-hover/row:to-[#349083]"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <div
                            className="absolute -top-1 h-4 w-0.5 bg-[#349083] rounded-full shadow-sm transition-all duration-500"
                            style={{ left: `${barWidth}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-medium">Market Share</span>
                          <span className="font-mono">
                            {percentage}% of total
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground gap-3 p-6">
                <div className="p-4 rounded-full bg-muted/50">
                  <TrophyIcon className="h-5 w-5 opacity-50" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    No Sales Data
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Sales information will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>

        {data.length > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"
            aria-hidden="true"
          />
        )}
      </Card>
    </div>
  )
}
