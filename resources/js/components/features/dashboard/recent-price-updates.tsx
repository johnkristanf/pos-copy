import { motion } from "framer-motion"
import { History } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { formatCurrency } from "@/lib/format"

interface RecentPriceUpdatesProps {
  recentPriceChanges: Array<{
    item: string
    sku: string
    old_price: number
    new_price: number
    changed_at: string
  }>
}

export const RecentPriceUpdates = ({
  recentPriceChanges,
}: RecentPriceUpdatesProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  }

  return (
    <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-3 sm:pb-4 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
              <History className="h-3.5 w-3.5 text-white" />
            </div>
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Recent Price Updates
            </CardTitle>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-1">
            Latest pricing changes and adjustments
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            {recentPriceChanges.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-10 px-4 gap-4"
              >
                <div className="relative">
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50">
                    <History className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No Recent Changes
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-xs">
                    Price updates will appear here once changes are made to
                    items.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="divide-y divide-border/40 p-3 sm:p-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {recentPriceChanges.map((log, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium line-clamp-1"
                            title={log.item}
                          >
                            {log.item}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {log.sku}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {log.changed_at}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Old:{" "}
                          <span className="line-through">
                            {formatCurrency(log.old_price)}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          New: {formatCurrency(log.new_price)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </ScrollArea>

          {recentPriceChanges.length > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"
              aria-hidden="true"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
