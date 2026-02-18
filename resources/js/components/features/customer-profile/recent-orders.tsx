import { router, usePage } from "@inertiajs/react"
import { Search, ShoppingBag } from "lucide-react"
import { useMemo, useState } from "react"
import { DateRange } from "react-day-picker"
import toast from "react-hot-toast"
import { Accordion } from "@/components/ui/common/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/common/card"
import { DatePickerWithRange } from "@/components/ui/common/date-range-picker"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { catchError } from "@/lib/catch-error"
import { formatCurrency } from "@/lib/format"
import { DetailedCustomer, Order, SharedData } from "@/types"
import { PayOrderForm } from "./pay-order-form"
import { RecentOrdersEmptyState } from "./recent-order-empty-state"
import { RecentOrderItem } from "./recent-order-items"
import { RecentOrderPrint } from "./recent-order-print"
import { RecentOrderSkeleton } from "./recent-order-skeleton"

export interface RecentOrder {
  id: number
  order_number: string
  po_number?: string | null
  total_payable: string | number
  payment_status: string | null
  status: string
  created_at: string
  is_void?: boolean
  customer?: any
  payment_method?: {
    id: number
    name: string
    tag: string
  }
  credits?: {
    id: number
    amount: string | number
    order_credit_payments?: {
      id: number
      amount: string | number
      created_at: string
    }[]
  }
  order_items?: {
    id: number
    quantity: number
    item?: {
      id: number
      image_url: string | null
      sku: string
      description: string
      brand: string
      selling_prices?: {
        id: number
        item_id: number
        unit_price: string | number
        wholesale_price: string | number
        credit_price: string | number
      }
    }
  }[]
}

interface RecentOrdersProps {
  orders: RecentOrder[] | undefined
  updatingOrderId?: number | null
  customer: DetailedCustomer
}

export function RecentOrders({
  orders,
  updatingOrderId,
  customer,
}: RecentOrdersProps) {
  const { openDialog, openConfirmation, closeDialog } = useDynamicDialog()
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const canPayOrder = viewWrapper([], ["receive_payment"], [], ["create"], user)

  const filteredOrders = useMemo(() => {
    if (!orders) return undefined

    return orders.filter((order) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        searchQuery === "" ||
        order.order_number.toLowerCase().includes(searchLower) ||
        order.po_number?.toLowerCase().includes(searchLower) ||
        order.order_items?.some(
          (item) =>
            item.item?.description?.toLowerCase().includes(searchLower) ||
            item.item?.sku?.toLowerCase().includes(searchLower),
        )

      let matchesDate = true
      if (dateRange?.from) {
        const orderDate = new Date(order.created_at)
        orderDate.setHours(0, 0, 0, 0)

        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)

        if (dateRange.to) {
          const toDate = new Date(dateRange.to)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = orderDate >= fromDate && orderDate <= toDate
        } else {
          matchesDate = orderDate >= fromDate
        }
      }

      return matchesSearch && matchesDate
    })
  }, [orders, searchQuery, dateRange])

  const handlePayOrder = (order: RecentOrder, remainingBalance: number) => {
    openDialog({
      title: "Pay Credit Order",
      description: `Enter the amount to pay for Order #${order.order_number}. Remaining Balance: ${formatCurrency(remainingBalance)}`,
      children: (
        <PayOrderForm
          order={{
            ...(order as unknown as Order),
            total_payable: remainingBalance.toString(),
          }}
          onSubmit={(amount) => {
            closeDialog()
            openConfirmation({
              title: "Confirm Payment",
              description: `This will record a payment of ${formatCurrency(amount)} for order ${order.order_number} and deduct it from the customer's credit balance. Are you sure you want to proceed?`,
              confirmText: "Pay Order",
              type: "warning",
              onConfirm: async () => {
                const paymentPromise = new Promise<void>((resolve, reject) => {
                  router.post(
                    API_ROUTES.PAY_CREDIT,
                    {
                      order_id: order.id,
                      amount: amount,
                    },
                    {
                      preserveScroll: true,
                      onSuccess: () => resolve(),
                      onError: (errors) => {
                        reject(
                          new Error(
                            (Object.values(errors)[0] as string) ||
                              "Failed to process payment",
                          ),
                        )
                      },
                    },
                  )
                })
                toast.promise(paymentPromise, {
                  loading: (
                    <span className="animate-pulse">Processing payment...</span>
                  ),
                  success: "Payment processed successfully!",
                  error: (error) => catchError(error),
                })
              },
            })
          }}
        />
      ),
    })
  }

  const handlePrintReceipt = (order: RecentOrder) => {
    openDialog({
      title: "Sales Invoice Preview",
      description: "Review and print the sales invoice.",
      children: (
        <RecentOrderPrint
          order={order}
          customer={customer}
          user={user}
          isVatEnabled={false}
        />
      ),
    })
  }

  return (
    <Card className="col-span-2 h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription className="mt-1.5">
              Latest transactions history from this customer.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders, items..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full sm:w-auto shrink-0"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-72">
          {filteredOrders === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <RecentOrderSkeleton key={i} />
              ))}
            </div>
          ) : filteredOrders.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredOrders.map((order) => (
                <RecentOrderItem
                  key={order.id}
                  order={order}
                  updatingOrderId={updatingOrderId}
                  canPayOrder={canPayOrder}
                  onPayOrder={handlePayOrder}
                  onPrintReceipt={handlePrintReceipt}
                />
              ))}
            </Accordion>
          ) : (
            <RecentOrdersEmptyState />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
