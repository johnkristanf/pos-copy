import {
  CreditCard,
  FileText,
  Package,
  PhilippinePeso,
  Printer,
} from "lucide-react"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/common/accordion"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { cn } from "@/lib/cn"
import { formatCurrency, formatDate } from "@/lib/format"
import { RecentOrderSkeleton } from "./recent-order-skeleton"
import { RecentOrder } from "./recent-orders"

interface RecentOrderItemProps {
  order: RecentOrder
  updatingOrderId?: number | null
  canPayOrder: boolean
  onPayOrder: (order: RecentOrder, remainingBalance: number) => void
  onPrintReceipt: (order: RecentOrder) => void
}

const getRecentOrdersStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "fully_paid":
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "pending":
    case "partially_paid":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
    case "cancelled":
    case "void":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
  }
}

export const RecentOrderItem = ({
  order,
  updatingOrderId,
  canPayOrder,
  onPayOrder,
  onPrintReceipt,
}: RecentOrderItemProps) => {
  if (order.id === updatingOrderId) {
    return <RecentOrderSkeleton />
  }

  const itemCount = order.order_items?.length || 0
  const isCreditOrder = order.payment_method?.tag === "credit"

  const orderPaymentStatus = order.payment_status?.toLowerCase()
  const orderStatus = order.status?.toLowerCase()

  const isFullyPaid =
    orderPaymentStatus === "fully_paid" ||
    orderPaymentStatus === "paid" ||
    orderStatus === "paid" ||
    orderStatus === "completed"

  const isCancelled =
    orderPaymentStatus === "cancelled" ||
    orderStatus === "cancelled" ||
    orderStatus === "void" ||
    order.is_void

  const showPayAction = isCreditOrder && !isFullyPaid && !isCancelled

  const totalPaid =
    order.credits?.order_credit_payments?.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    ) || 0
  const remainingBalance = Math.max(0, Number(order.total_payable) - totalPaid)
  const isPartiallyPaid = totalPaid > 0 && remainingBalance > 0

  return (
    <AccordionItem
      value={order.id.toString()}
      className="group border rounded-xl hover:bg-muted/40 hover:border-primary/20 transition-all duration-200 overflow-hidden bg-card"
    >
      <AccordionTrigger className="px-4 py-4 hover:no-underline">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left pr-4 gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-sm text-foreground">
                {order.order_number}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                  getRecentOrdersStatusColor(
                    order.payment_status || order.status!,
                  ),
                )}
              >
                {order.payment_status?.replace("_", " ") || order.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-0.5">
              <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                <span className="font-medium text-foreground">
                  {formatDate(order.created_at)}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    {order.payment_method.name}
                  </span>
                </div>
              )}
              {order.po_number && (
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    PO: {order.po_number}
                  </span>
                </div>
              )}
              {itemCount > 0 && (
                <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                  <Package className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    {itemCount} item{itemCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-dashed pt-3 sm:pt-0">
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right mr-1">
              <span className="font-bold text-lg tabular-nums tracking-tight">
                {formatCurrency(
                  isPartiallyPaid
                    ? remainingBalance
                    : Number(order.total_payable),
                )}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {isPartiallyPaid ? "Remaining Balance" : "Total Amount"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {showPayAction && canPayOrder && (
                <Button
                  size="lg"
                  variant="bridge_digital"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-primary/20 text-white hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPayOrder(order, remainingBalance)
                  }}
                  title="Pay with Credit Balance"
                >
                  <PhilippinePeso className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </Button>
              )}

              {!isFullyPaid && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-colors shrink-0 shadow-sm bg-background hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrintReceipt(order)
                  }}
                  title="Print Receipt"
                >
                  <Printer className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="pt-4 border-t border-dashed space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Ordered Items
          </h4>
          <div className="grid gap-3">
            {order.order_items?.map((item) => (
              <div
                key={item.id}
                className="group/item flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm bg-background hover:bg-muted/30 transition-colors p-3 rounded-xl border border-border shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30">
                    {item.item?.image_url ? (
                      <img
                        src={item.item.image_url}
                        alt={item.item.description || "Item image"}
                        className="h-full w-full object-cover transition-transform group-hover/item:scale-105 duration-300"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate leading-snug">
                      {item.item?.description}
                    </span>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-muted px-1.5 py-0.5 rounded shadow-xs border border-border/50">
                        {item.item?.sku}
                      </span>
                      {item.item?.brand && item.item.brand !== "N/A" && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="truncate font-medium">
                            {item.item.brand}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 shrink-0 pt-2 sm:pt-0 border-t border-dashed sm:border-none">
                  {item.item?.selling_prices && (
                    <div className="flex items-center gap-4 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">
                          Unit Price
                        </span>
                        <span className="font-semibold text-xs tabular-nums">
                          {formatCurrency(
                            Number(item.item.selling_prices.unit_price),
                          )}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-border/80" />
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">
                          Credit Price
                        </span>
                        <span className="font-semibold text-xs tabular-nums">
                          {formatCurrency(
                            Number(item.item.selling_prices.credit_price),
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center">
                    <Badge
                      variant="secondary"
                      className="font-mono text-sm px-3 py-1 shadow-sm border-border"
                    >
                      x{item.quantity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
