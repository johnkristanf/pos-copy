import { router } from "@inertiajs/react"
import { motion } from "framer-motion"
import { AlertCircle, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { PAGE_ROUTES } from "@/config/page-routes"

interface ActionNeededProps {
  unpricedItems: Array<{
    id: number
    sku: string
    name: string
    stock_count: number
  }>
}

export const ActionNeeded = ({ unpricedItems }: ActionNeededProps) => {
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
            <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Action Needed
            </CardTitle>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed mt-1">
            Items requiring immediate attention
          </p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            {unpricedItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 px-4 gap-4"
              >
                <div className="relative">
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50">
                    <Package className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    All Items Priced
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-xs">
                    Great job! All active stock has been properly priced and is
                    ready for sale.
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
                {unpricedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 items-center min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-border/50">
                            <Package className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <p
                              className="text-sm font-semibold text-foreground line-clamp-1"
                              title={item.name}
                            >
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Stock: {item.stock_count}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={"bridge_digital"}
                          onClick={() => router.visit(PAGE_ROUTES.ITEMS_PRICE)}
                        >
                          <Plus className="h-3 w-3 mr-1 group-hover/btn:rotate-90 transition-transform duration-300" />{" "}
                          Set Price{" "}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </ScrollArea>

          {unpricedItems.length > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-linear-to-t from-white via-white/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"
              aria-hidden="true"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
