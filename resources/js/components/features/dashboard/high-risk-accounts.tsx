import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/common/table"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"

interface AtRiskCustomersTableProps {
  customers: Array<{
    name: string
    rating: number
    balance: number
    utilization: number
  }>
}

export const HighRiskAccounts = ({ customers }: AtRiskCustomersTableProps) => {
  const criticalCount = customers.filter((c) => c.utilization > 90).length
  const highRiskCount = customers.filter(
    (c) => c.utilization > 75 && c.utilization <= 90,
  ).length

  const getRiskLevel = (utilization: number) => {
    if (utilization > 90) return "critical"
    if (utilization > 75) return "high"
    if (utilization > 50) return "medium"
    return "low"
  }

  const getRiskStyles = (utilization: number) => {
    const risk = getRiskLevel(utilization)
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
      case "high":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900/50"
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
    }
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  High Risk Accounts
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Customers with low rating & high utilization
              </CardDescription>
            </div>

            <Badge
              variant="destructive"
              className="shadow-sm text-[10px] px-2 py-0.5"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          </div>

          {customers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              {criticalCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                  {criticalCount} Critical
                </Badge>
              )}
              {highRiskCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
                  {highRiskCount} High Risk
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
              >
                {customers.length} Total
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold text-xs py-3">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3">
                      Credit Rating
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs py-3">
                      Balance
                    </TableHead>
                    <TableHead className="text-right font-semibold text-xs py-3">
                      Utilization
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer, i) => {
                      const riskLevel = getRiskLevel(customer.utilization)
                      return (
                        <TableRow
                          key={i}
                          className={cn(
                            "group/row border-b border-border/40 hover:bg-linear-to-r transition-colors",
                            riskLevel === "critical" &&
                              "hover:from-red-50/80 hover:to-transparent dark:hover:from-red-950/30 dark:hover:to-transparent",
                            riskLevel === "high" &&
                              "hover:from-amber-50/80 hover:to-transparent dark:hover:from-amber-950/30 dark:hover:to-transparent",
                            riskLevel !== "critical" &&
                              riskLevel !== "high" &&
                              "hover:from-zinc-50/80 hover:to-transparent dark:hover:from-zinc-900/50 dark:hover:to-transparent",
                          )}
                        >
                          <TableCell className="py-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-sm group-hover/row:text-foreground transition-colors">
                                {customer.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, starIndex) => (
                                <span
                                  key={starIndex}
                                  className={cn(
                                    "text-base transition-all",
                                    starIndex < customer.rating
                                      ? "text-yellow-500 dark:text-yellow-400"
                                      : "text-zinc-300 dark:text-zinc-700",
                                  )}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <span className="font-mono font-semibold text-sm">
                              {formatCurrency(customer.balance)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex-1 max-w-20">
                                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      riskLevel === "critical" && "bg-red-500",
                                      riskLevel === "high" && "bg-amber-500",
                                      riskLevel === "medium" && "bg-yellow-500",
                                      riskLevel === "low" && "bg-zinc-400",
                                    )}
                                    style={{
                                      width: `${customer.utilization}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-mono text-[10px] px-2 py-0.5 border",
                                  getRiskStyles(customer.utilization),
                                )}
                              >
                                {customer.utilization}%
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={4}
                        className="h-40 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4">
                            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                              All Accounts Healthy
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              No high-risk accounts detected
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="sm:hidden p-3 space-y-3">
              {customers.length > 0 ? (
                customers.map((customer, i) => {
                  const riskLevel = getRiskLevel(customer.utilization)
                  return (
                    <div
                      key={i}
                      className={cn(
                        "relative flex flex-col gap-3 p-3 rounded-lg border transition-all",
                        riskLevel === "critical" &&
                          "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50",
                        riskLevel === "high" &&
                          "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50",
                        riskLevel !== "critical" &&
                          riskLevel !== "high" &&
                          "bg-zinc-50/50 border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-800",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {customer.name}
                          </p>
                          <div className="flex items-center gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <span
                                key={starIndex}
                                className={cn(
                                  "text-sm",
                                  starIndex < customer.rating
                                    ? "text-yellow-500"
                                    : "text-zinc-300 dark:text-zinc-700",
                                )}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px] px-2 py-0.5 border shrink-0",
                            getRiskStyles(customer.utilization),
                          )}
                        >
                          {customer.utilization}%
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Balance</span>
                          <span className="font-mono font-semibold">
                            {formatCurrency(customer.balance)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                              Utilization
                            </span>
                            <span className="font-medium">
                              {customer.utilization}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                riskLevel === "critical" && "bg-red-500",
                                riskLevel === "high" && "bg-amber-500",
                                riskLevel === "medium" && "bg-yellow-500",
                                riskLevel === "low" && "bg-zinc-400",
                              )}
                              style={{ width: `${customer.utilization}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                      All Accounts Healthy
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      No high-risk accounts detected
                    </p>
                  </div>
                </div>
              )}
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
