import { router } from "@inertiajs/react"
import { AnimatePresence, motion } from "framer-motion"
import { Box, ChevronDown, ChevronUp, ExternalLink, MapPin } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { PAGE_ROUTES } from "@/config/page-routes"

interface TransactionItem {
  item_name: string
  sku: string
  quantity_to_release: number
  bin_location: string
}

interface Transaction {
  id: number
  order_number: string
  customer_name: string
  items_count: number
  status: string
  time_ago: string
  priority: string
  items: TransactionItem[]
}

interface FulfillmentQueueProps {
  queue: Transaction[]
}

export const FulfillmentQueue = ({ queue }: FulfillmentQueueProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleProcessOrder = (id: number) => {
    router.get(PAGE_ROUTES.ORDERS_ACTIVE_ORDERS_PAGE, {
      highlight_order_id: id,
    })
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="group relative h-full rounded-xl transition-all duration-300 hover:shadow-lg">
        <div
          className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden="true"
        />

        <Card className="relative h-full flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden z-10">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-border/40 bg-linear-to-br from-zinc-50/50 to-zinc-100/30 dark:from-zinc-900/50 dark:to-zinc-800/30 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Box className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Fulfillment Queue
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="font-mono text-[10px] px-2 py-0.5 shadow-sm border-0 bg-[#349083]/15 text-[#349083] dark:text-[#e3ea4e] hover:bg-[#349083]/25"
              >
                {queue.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="space-y-3">
              {queue.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-50 gap-3"
                >
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4/40">
                    <Box className="size-7 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      No Pending Orders
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Orders waiting for release will appear here
                    </p>
                  </div>
                </motion.div>
              ) : (
                queue.map((tx) => (
                  <Card
                    key={tx.id}
                    className={`overflow-hidden transition-all duration-200 ${
                      expandedId === tx.id
                        ? "ring-1 ring-[#349083] border-[#349083]/50 shadow-md"
                        : "hover:border-[#349083]/30 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer flex items-center justify-between bg-card hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                      onClick={() => toggleExpand(tx.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">
                            {tx.order_number}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tx.time_ago}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-border hidden sm:block" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {tx.customer_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {tx.items_count} items to release
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:bg-[#349083]/10 hover:text-[#349083]"
                        >
                          {expandedId === tx.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === tx.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-border/50 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <div className="py-2 mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              <span>Item Checklist</span>
                              <span>Bin Location</span>
                            </div>
                            <div className="space-y-2">
                              {tx.items.map((item, idx) => {
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded-md border bg-background border-border"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="grid gap-0.5">
                                        <span className="text-sm font-medium leading-none">
                                          {item.item_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          SKU: {item.sku} • Qty:{" "}
                                          {item.quantity_to_release}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1 font-mono text-xs"
                                    >
                                      <MapPin className="h-3 w-3" />
                                      {item.bin_location}
                                    </Badge>
                                  </div>
                                )
                              })}
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button
                                className="w-full sm:w-auto"
                                variant="bridge_digital"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleProcessOrder(tx.id)
                                }}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Order to Release
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
