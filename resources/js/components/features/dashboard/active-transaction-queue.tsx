import { router } from "@inertiajs/react"
import { motion, Variants } from "framer-motion"
import {
  ArrowRight,
  Clock,
  CreditCard,
  Receipt,
  TicketCheck,
  User,
  Users,
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
import { formatCurrency } from "@/lib/format"

export interface PendingTransaction {
  id: number
  order_number: string
  customer_name: string
  customer_rating: number
  total_payable: number
  amount_paid: number
  payment_status: string
  payment_method: string
  time_ago: string
}

interface ActiveTransactionQueueProps {
  pendingTransactions: PendingTransaction[]
}

export const ActiveTransactionQueue = ({
  pendingTransactions,
}: ActiveTransactionQueueProps) => {
  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase()
    if (methodLower.includes("cash")) {
      return <CreditCard className="h-3 w-3" />
    }
    return <CreditCard className="h-3 w-3" />
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
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
                  <Receipt className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Active Transaction Queue
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Manage pending transactions and orders
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-2 py-0.5 shadow-sm border-0 bg-[#349083]/15 text-[#349083] dark:text-[#e3ea4e] hover:bg-[#349083]/25 self-start sm:self-auto"
            >
              <Users className="h-3 w-3 mr-1" />
              {pendingTransactions.length} Pending
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            {/* Desktop & Tablet View - Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-20 shadow-sm">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="font-semibold text-xs py-3 w-30">
                      <span className="ml-2">Order #</span>
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3">
                      Method
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3">
                      Wait Time
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3 text-right">
                      <span className="mr-12">Action</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="h-140 text-center text-muted-foreground"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="mt-50 p-3 sm:p-4 rounded-full bg-muted/50 mb-3 sm:mb-4/40">
                            <TicketCheck className="h-7 w-7 text-muted-foreground opacity-50" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              No Pending Transactions
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              All orders are processed
                            </p>
                          </div>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingTransactions.map((tx) => (
                      <motion.tr
                        key={tx.id}
                        variants={rowVariants}
                        className="group/row border-b border-border/40 last:border-0 hover:bg-linear-to-r hover:from-zinc-50/80 hover:to-transparent dark:hover:from-zinc-900/50 dark:hover:to-transparent transition-colors"
                      >
                        <TableCell className="py-3 align-middle">
                          <div className="ml-2 font-mono font-semibold text-sm text-foreground group-hover/row:text-[#349083] transition-colors">
                            {tx.order_number}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {tx.customer_name}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-sm text-foreground">
                              {formatCurrency(tx.total_payable)}
                            </span>
                            {tx.amount_paid > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                Paid: {formatCurrency(tx.amount_paid)}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {getPaymentMethodIcon(tx.payment_method)}
                            <span>{tx.payment_method}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{tx.time_ago}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right py-3 align-middle">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mr-4 h-8 px-3 text-xs font-medium hover:bg-[#349083]/10 hover:text-[#349083] group/btn"
                            onClick={() =>
                              router.get(
                                PAGE_ROUTES.ORDERS_ACTIVE_ORDERS_PAGE,
                                {
                                  highlight_order_id: tx.id,
                                },
                              )
                            }
                          >
                            Process
                            <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View - Card List */}
            <motion.div
              className="md:hidden p-3 space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {pendingTransactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <div className="h-14 w-14 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border border-border/40">
                    <Receipt className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="font-semibold text-sm text-foreground">
                      No Pending Transactions
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      All orders are processed
                    </p>
                  </div>
                </motion.div>
              ) : (
                pendingTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    variants={rowVariants}
                    className="relative flex flex-col gap-3 p-3 rounded-lg border border-border/60 bg-linear-to-br from-zinc-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-950 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-medium text-sm text-foreground truncate">
                            {tx.customer_name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded w-fit">
                            {tx.order_number}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-border/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Total Amount
                        </span>
                        {tx.amount_paid > 0 && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Paid: {formatCurrency(tx.amount_paid)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-lg font-bold text-foreground">
                        {formatCurrency(tx.total_payable)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {getPaymentMethodIcon(tx.payment_method)}
                        <span>{tx.payment_method}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{tx.time_ago}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full h-9 text-xs font-medium bg-linear-to-r from-[#349083] to-[#2a7569] hover:from-[#2a7569] hover:to-[#349083] text-white group"
                      onClick={() =>
                        router.get(PAGE_ROUTES.ORDERS_ACTIVE_ORDERS_PAGE, {
                          highlight_order_id: tx.id,
                        })
                      }
                    >
                      Process Order
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </motion.div>
                ))
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
