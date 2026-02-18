import { Link } from "@inertiajs/react"
import { ChevronRight, Clock, CreditCard, User } from "lucide-react"

import { DashboardStatusDot } from "@/components/ui/common/status-dot"
import { PAGE_ROUTES } from "@/config/page-routes"
import { formatCurrency } from "@/lib/format"

import { RecentOrder } from "./list-of_transactions"

interface TransactionRowProps {
  order: RecentOrder
}

export const TransactionRow = ({ order }: TransactionRowProps) => {
  return (
    <div className="group relative border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30">
      <div className="block space-y-3 p-4 sm:hidden">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold tracking-tight text-foreground">
            {order.order_number}
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {formatCurrency(order.amount)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex max-w-[60%] items-center gap-1.5 truncate text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{order.customer_name}</span>
          </div>
          <DashboardStatusDot status={order.status} />
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-2">
          <div className="flex items-center gap-1.5 rounded-sm bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            {order.payment_method}
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {order.time_ago}
          </div>
        </div>
      </div>

      <div className="hidden items-center justify-between gap-4 p-4 sm:flex">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                {order.order_number}
              </span>
              <DashboardStatusDot status={order.status} />
            </div>
            <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate font-medium">
                {order.customer_name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-6">
          <div className="flex min-w-24 flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-sm bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              {order.payment_method}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {order.time_ago}
            </span>
          </div>

          <div className="min-w-25 border-l border-border/40 pl-4 text-right">
            <div className="font-mono text-sm font-bold text-foreground">
              {formatCurrency(order.amount)}
            </div>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      <Link
        href={`${PAGE_ROUTES.ORDERS_ALL_ORDERS_PAGE}?highlight=${order.id}#order-${order.id}`}
        className="absolute inset-0 z-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
