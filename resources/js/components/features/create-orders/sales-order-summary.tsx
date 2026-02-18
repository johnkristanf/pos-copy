import { formatCurrency } from "@/lib/format"
import { useCreateOrderStore, useSelectedItems } from "./use-create-order-store"
import { useDraftOrderState } from "./use-draft-order-store"

export const SalesOrderSummary = () => {
  const selectedItems = useSelectedItems()
  const quantities = useCreateOrderStore((state) => state.quantities)
  const { discount } = useDraftOrderState()
  const items = Object.values(selectedItems)

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.selling_prices?.unit_price) || 0
    const quantity = quantities[item.id] ?? 1
    return sum + price * quantity
  }, 0)

  const totalPayable = subtotal - discount

  return (
    <div className="flex flex-col filter">
      <div className="flex flex-col gap-3 rounded-t-lg border-x border-t bg-card p-4 pb-2">
        <span className="font-semibold mb-2">Sales Order Summary</span>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-destructive">
            {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
          </span>
        </div>
      </div>

      <div className="flex h-5 w-full items-center">
        <div className="h-full w-2.5 relative overflow-hidden">
          <svg
            width="10"
            height="20"
            viewBox="0 0 10 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-0 top-0 w-full h-full text-card"
          >
            <path
              d="M0 0 A 10 10 0 0 1 0 20 L 10 20 L 10 0 Z"
              fill="currentColor"
            />
            <path
              d="M0 0 A 10 10 0 0 1 0 20"
              className="stroke-border"
              strokeWidth="1"
              fill="none"
            />
            <line
              x1="10"
              y1="0"
              x2="10"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="h-full flex-1 bg-card relative flex items-center justify-center">
          <div className="w-full border-t-2 border-dashed border-muted-foreground/20" />
        </div>

        <div className="h-full w-2.5 relative overflow-hidden">
          <svg
            width="10"
            height="20"
            viewBox="0 0 10 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-0 top-0 w-full h-full text-card"
          >
            <path
              d="M10 0 A 10 10 0 0 0 10 20 L 0 20 L 0 0 Z"
              fill="currentColor"
            />
            <path
              d="M10 0 A 10 10 0 0 0 10 20"
              className="stroke-border"
              strokeWidth="1"
              fill="none"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-b-lg border-x border-b bg-card p-4 pt-2">
        <span className="font-bold text-base">Total Payable</span>
        <span className="font-bold text-xl text-primary">
          {formatCurrency(totalPayable)}
        </span>
      </div>
    </div>
  )
}
