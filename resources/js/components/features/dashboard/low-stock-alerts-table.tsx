import { Link } from "@inertiajs/react"
import { motion, Variants } from "framer-motion"
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  PackageCheck,
  PackagePlus,
} from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
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
import { PAGE_ROUTES } from "@/config/page-routes"

interface LowStockAlert {
  id: number
  sku: string
  name: string
  current_level: number
  reorder_point: number
  status: "Critical" | "Low"
}

interface LowStockAlertsTableProps {
  alerts: LowStockAlert[]
  isInventoryOfficer?: boolean
}

export const LowStockAlertsTable = ({
  alerts,
  isInventoryOfficer,
}: LowStockAlertsTableProps) => {
  const criticalCount = alerts.filter((a) => a.status === "Critical").length
  const lowCount = alerts.filter((a) => a.status === "Low").length

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  }

  const getStockPercentage = (current: number, reorder: number) => {
    const percentage = Math.round((current / (reorder * 1.5)) * 100)
    return Math.min(percentage, 100)
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <AlertCircle className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Low Stock Alerts
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Items requiring immediate attention
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {criticalCount > 0 && (
                <Badge
                  variant="destructive"
                  className="font-mono text-[10px] px-2 py-0.5 shadow-sm border-0 bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25"
                >
                  <AlertOctagon className="h-3 w-3 mr-1" />
                  {criticalCount} Critical
                </Badge>
              )}
              {lowCount > 0 && (
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] px-2 py-0.5 shadow-sm border-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {lowCount} Low
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            <div className="hidden sm:block">
              <Table>
                <TableHeader className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold text-xs py-3 w-[35%] md:w-[40%]">
                      <span className="ml-2">Item Details</span>
                    </TableHead>
                    <TableHead className="text-left font-semibold text-xs py-3">
                      Stock Level
                    </TableHead>
                    <TableHead className="text-center font-semibold text-xs py-3">
                      Status
                    </TableHead>
                    {!isInventoryOfficer && (
                      <TableHead className="text-right font-semibold text-xs py-3">
                        <span className="mr-4 lg:mr-10">Action</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <motion.tr
                        key={alert.id}
                        variants={rowVariants}
                        className="group/row border-b border-border/40 last:border-0 hover:bg-linear-to-r hover:from-zinc-50/80 hover:to-transparent dark:hover:from-zinc-900/50 dark:hover:to-transparent transition-colors"
                      >
                        <TableCell className="py-3 align-top">
                          <div className="space-y-1">
                            <div className="ml-2 font-semibold text-sm group-hover/row:text-[#349083] transition-colors line-clamp-2">
                              {alert.name}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-muted-foreground font-mono">
                                {alert.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-top">
                          <div className="space-y-1.5 max-w-30 md:max-w-35">
                            <div className="flex items-end justify-between gap-2">
                              <span
                                className={`font-mono font-bold text-sm ${
                                  alert.status === "Critical"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                {alert.current_level}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                / {alert.reorder_point} Min
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  alert.status === "Critical"
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${getStockPercentage(alert.current_level, alert.reorder_point)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-3 align-top">
                          <Badge
                            variant="outline"
                            className={`font-medium text-[10px] w-20 border px-2 py-0.5 ${
                              alert.status === "Critical"
                                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
                                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
                            }`}
                          >
                            {alert.status === "Critical" ? (
                              <AlertOctagon className="size-3 mr-1" />
                            ) : (
                              <AlertTriangle className="size-3 mr-1" />
                            )}
                            {alert.status}
                          </Badge>
                        </TableCell>

                        {!isInventoryOfficer && (
                          <TableCell className="text-right py-3 align-top">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 mr-4 lg:mr-10 p-0 rounded-full hover:bg-[#349083]/10 hover:text-[#349083]"
                              title="Restock Item"
                              asChild
                            >
                              <Link href={PAGE_ROUTES.ITEMS_STOCK_IN_PAGE}>
                                <PackagePlus className="size-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={!isInventoryOfficer ? 4 : 3}
                        className="h-40 text-center text-muted-foreground"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4/40">
                            <PackageCheck className="size-7 text-zinc-400 dark:text-zinc-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              All Stock Levels Normal
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              No items are below reorder point
                            </p>
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <motion.div
              className="sm:hidden p-3 space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    variants={rowVariants}
                    className={`relative flex flex-col gap-3 p-3 rounded-lg border ${
                      alert.status === "Critical"
                        ? "bg-linear-to-br from-red-50/50 to-red-100/30 dark:from-red-950/20 dark:to-red-900/10 border-red-200 dark:border-red-900/50"
                        : "bg-linear-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                          {alert.name}
                        </h3>
                        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-muted-foreground font-mono">
                          {alert.sku}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 font-medium text-[10px] border px-2 py-0.5 ${
                          alert.status === "Critical"
                            ? "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                            : "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                        }`}
                      >
                        {alert.status === "Critical" ? (
                          <AlertOctagon className="size-3 mr-1" />
                        ) : (
                          <AlertTriangle className="size-3 mr-1" />
                        )}
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          Stock Level
                        </span>
                        <div className="flex items-end gap-2">
                          <span
                            className={`font-mono font-bold text-base ${
                              alert.status === "Critical"
                                ? "text-red-600 dark:text-red-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {alert.current_level}
                          </span>
                          <span className="text-[10px] text-muted-foreground pb-0.5">
                            / {alert.reorder_point} Min
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            alert.status === "Critical"
                              ? "bg-red-500"
                              : "bg-amber-500"
                          }`}
                          style={{
                            width: `${getStockPercentage(alert.current_level, alert.reorder_point)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {!isInventoryOfficer && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={`w-full h-8 text-xs font-medium ${
                          alert.status === "Critical"
                            ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                            : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
                        }`}
                        asChild
                      >
                        <Link href={PAGE_ROUTES.ITEMS_STOCK_IN_PAGE}>
                          <PackagePlus className="size-3.5 mr-1.5" />
                          Restock Item
                        </Link>
                      </Button>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <div className="h-14 w-14 rounded-full bg-linear-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50">
                    <PackageCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-sm text-foreground">
                      All Stock Levels Normal
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      No items are below reorder point
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
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
