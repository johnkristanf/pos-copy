import { Calendar, CreditCard, Hash, Package } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { formatCurrency } from "@/lib/format"
import { Order, OrderItem } from "@/types"
import { AllOrdersActions } from "./all-orders-actions"

interface MobileAllOrdersCardProps {
  order: Order
}

export const MobileAllOrdersCard = ({ order }: MobileAllOrdersCardProps) => {
  const itemsToDisplay = (order.order_items || order.items || []) as OrderItem[]

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg">
            {order.customer?.name || "Unknown Customer"}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Hash className="h-3 w-3" />
            Order #{order.id}
          </div>
        </div>
        <AllOrdersActions order={order} />
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="font-bold text-base">
            {formatCurrency(Number(order.total_payable))}
          </div>
        </div>

        {itemsToDisplay.length > 0 && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Package className="h-4 w-4 mt-0.5" />
            <span className="line-clamp-2">
              {itemsToDisplay
                .map((i) => {
                  const desc = i.item?.description || "Item"
                  const qty = i.pivot?.quantity || i.quantity || 0
                  return `${desc} (${qty})`
                })
                .join(", ")}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span className="capitalize">
            {order.payment_method?.name || order.payment_method_id || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="capitalize">
            {order.payment_status || "Recorded"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
