import { ArrowDownRight, CreditCard, History } from "lucide-react"
import { useMemo } from "react"
import { Badge } from "@/components/ui/common/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { formatCurrency, formatDate } from "@/lib/format"
import { RecentOrder } from "./recent-orders"

interface CreditPaymentHistoryProps {
  recentOrders?: RecentOrder[]
}

export function CreditPaymentHistory({
  recentOrders,
}: CreditPaymentHistoryProps) {
  const paymentHistory = useMemo(() => {
    if (!recentOrders) return []

    return recentOrders
      .filter((order) => order.credits?.order_credit_payments?.length)
      .flatMap((order) => {
        return (
          order.credits?.order_credit_payments?.map((payment) => ({
            ...payment,
            order_number: order.order_number,
            order_total: Number(order.total_payable),
          })) || []
        )
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
  }, [recentOrders])

  if (!recentOrders || paymentHistory.length === 0) return null

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4 text-primary" />
          Recent Payments
        </CardTitle>
        <CardDescription className="text-xs">
          Latest credit payment transactions.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 ">
        <ScrollArea className="h-37 max-h-40">
          <div className="flex flex-col divide-y divide-border/50">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm leading-none text-foreground">
                      {payment.order_number}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Credit Payment
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-right">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 font-semibold text-sm tabular-nums"
                  >
                    +{formatCurrency(Number(payment.amount))}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatDate(payment.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
