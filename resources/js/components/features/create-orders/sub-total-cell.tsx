import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { formatCurrency } from "@/lib/format"
import { OrderableItem } from "@/types"
import {
  useCreateOrderStore,
  useSelectedItems,
  useSelectedPriceTypes,
} from "./use-create-order-store"

interface SubtotalCellProps {
  item: OrderableItem
}

export const SubtotalCell = ({ item }: SubtotalCellProps) => {
  const selectedItems = useSelectedItems()
  const selectedPriceTypes = useSelectedPriceTypes()

  const quantity = useCreateOrderStore(
    (state) => state.quantities[item.id] || 0,
  )

  const storeItem = selectedItems[item.id]
  const activeItem = storeItem || item

  const currentPriceType = selectedPriceTypes[item.id] || "unit_price"
  const price = activeItem.selling_prices?.[currentPriceType] || 0
  const subtotal = Number(price) * quantity

  if (quantity === 0) {
    return <div className="text-right text-muted-foreground">-</div>
  }

  return (
    <div className="text-right">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-semibold text-sm cursor-help border-b border-dashed border-muted-foreground/30 hover:text-primary transition-colors">
            {formatCurrency(subtotal)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          Exact Subtotal: {formatCurrency(subtotal)}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
