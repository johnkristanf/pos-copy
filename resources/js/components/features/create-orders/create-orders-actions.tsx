import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { OrderableItem } from "@/types"

interface CreateOrdersActionsProps {
  item: OrderableItem
}

export const CreateOrdersActions = ({ item }: CreateOrdersActionsProps) => {
  const totalStock =
    item.stocks?.reduce((acc, s) => acc + s.available_quantity, 0) ?? 0
  const isOutOfStock = totalStock <= 0

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isOutOfStock}
      className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
      title={isOutOfStock ? "Out of Stock" : "Add to Order"}
      onClick={() => console.log("Add item to order", item.id)}
    >
      <ShoppingCart className="h-4 w-4" />
      <span className="sr-only">Add to order</span>
    </Button>
  )
}
