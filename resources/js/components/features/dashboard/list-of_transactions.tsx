import { Link } from "@inertiajs/react"
import { motion, Variants } from "framer-motion"
import { ArrowRight, Plus, Receipt, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { PAGE_ROUTES } from "@/config/page-routes"
import { TransactionRow } from "./transaction-row"

export interface RecentOrder {
  id: number
  order_number: string
  customer_name: string
  amount: string
  status: string
  time_ago: string
  payment_method: string
}

interface ListOfTransactionsProps {
  recentOrders: RecentOrder[]
}

export const ListOfTransactions = ({
  recentOrders,
}: ListOfTransactionsProps) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  }

  const itemVariants: Variants = {
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Receipt className="h-3.5 w-3.5 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Recent Transactions
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Latest orders and activities
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-medium group/btn self-start sm:self-auto"
              variant={"bridge_digital"}
              asChild
            >
              <Link href={PAGE_ROUTES.CREATE_ORDERS_PAGE}>
                <Plus className="h-3.5 w-3.5 mr-1 group-hover/btn:rotate-90 transition-transform duration-300" />
                Create Order
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full">
            {recentOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-100 px-4 gap-4"
              >
                <div className="relative">
                  <div className="p-3 sm:p-4 rounded-full bg-muted/50">
                    <ShoppingCart className="h-7 w-7 text-muted-foreground opacity-50" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center">
                  <p className="font-semibold text-sm text-foreground">
                    No Recent Transactions
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-xs">
                    Your recent orders will appear here once you start creating
                    transactions
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-8 px-4 text-xs font-medium border-border/50 hover:border-[#349083]/50 hover:bg-[#349083]/5 hover:text-[#349083] transition-all group/empty"
                  asChild
                >
                  <Link href={PAGE_ROUTES.CREATE_ORDERS_PAGE}>
                    <Plus className="h-3.5 w-3.5 mr-1.5 group-hover/empty:rotate-90 transition-transform duration-300" />
                    Create First Order
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className="divide-y divide-border/40"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {recentOrders.map((order) => (
                  <motion.div key={order.id} variants={itemVariants}>
                    <TransactionRow order={order} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </ScrollArea>

          {/* Fade effect at bottom */}
          {recentOrders.length > 0 && (
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
