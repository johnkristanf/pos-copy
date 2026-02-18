import { AlertCircle, PhilippinePeso } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"
import { OrderableItem } from "@/types"
import {
  OrderItemError,
  PriceType,
  useCreateOrderActions,
  useCreateOrderStore,
} from "./use-create-order-store"

export const CreateOrderPriceHeader = () => {
  const globalPriceType = useCreateOrderStore((state) => state.globalPriceType)
  const { setGlobalPriceType } = useCreateOrderActions()

  return (
    <div className="flex items-center justify-end gap-1 min-w-40">
      <PhilippinePeso className="size-3.5 text-muted-foreground" />
      <Select
        value={globalPriceType}
        onValueChange={(val) => setGlobalPriceType(val as any)}
      >
        <SelectTrigger className="h-7 text-xs font-semibold bg-transparent border-0 shadow-none focus:ring-0 px-1.5 hover:bg-muted/50 rounded-sm transition-colors w-fit gap-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unit_price">Unit Price</SelectItem>
          <SelectItem value="wholesale_price">Wholesale Price</SelectItem>
          <SelectItem value="credit_price">Credit Price</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
interface CreateOrderPriceCellProps {
  item: OrderableItem
  selectedItems: Record<number, OrderableItem>
  selectedIds: Set<number>
  selectedPriceTypes: Record<number, PriceType>
  errors: Record<number, OrderItemError>
}

export const CreateOrderPriceCell = ({
  item,
  selectedItems,
  selectedIds,
  selectedPriceTypes,
  errors,
}: CreateOrderPriceCellProps) => {
  const storeItem = selectedItems[item.id]
  const prices = storeItem?.selling_prices ?? item.selling_prices

  const error = errors[item.id]?.price
  const isSelected = selectedIds.has(item.id)
  const currentPriceType = selectedPriceTypes[item.id] || "unit_price"

  if (!prices || !prices.unit_price) {
    return (
      <div className="flex justify-end">
        <Tooltip open={!!error}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-destructive cursor-help">
              <AlertCircle className="size-3.5" />
              <span className="text-xs italic font-medium">Not Set</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-destructive">
            {error || "Price is not set."}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "text-sm font-medium transition-colors text-right",
        isSelected ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {formatCurrency(Number(prices[currentPriceType]))}
    </div>
  )
}
