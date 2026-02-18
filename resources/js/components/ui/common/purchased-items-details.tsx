// resources/js/components/ui/common/purchased-items-details.tsx
import { Package, Search } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { ScrollArea } from "@/components/ui/common/scroll-area"
import { Input } from "@/components/ui/inputs/input"
import { formatCurrency } from "@/lib/format"
import { Order, OrderItem } from "@/types"

interface PurchasedItemsDetailsProps {
  order: Order
  items: OrderItem[]
}

export const PurchasedItemsDetails = ({
  order,
  items,
}: PurchasedItemsDetailsProps) => {
  const [search, setSearch] = useState("")

  const filteredItems = items.filter((lineItem: OrderItem) => {
    const term = search.toLowerCase()
    const description = (lineItem.item?.description || "").toLowerCase()
    const sku = (lineItem.item?.sku || "").toLowerCase()
    return description.includes(term) || sku.includes(term)
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80 transition-colors"
        >
          {items.length} item{items.length !== 1 ? "s" : ""}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-neutral-200" align="start">
        <div className="border-b border-neutral-100 bg-neutral-50/50 p-4">
          <h4 className="font-semibold leading-none text-sm text-neutral-900">
            Order Items
          </h4>
          <p className="mb-3 mt-1 text-[11px] text-neutral-500 font-medium uppercase tracking-tight">
            Breakdown for Order #{order.id}
          </p>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400 z-10" />
            <Input
              placeholder="Filter items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-white border-neutral-200 focus:ring-neutral-500"
            />
          </div>
        </div>
        <ScrollArea className="h-30">
          <div className="flex flex-col">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-medium italic">
                No items found
              </div>
            ) : (
              filteredItems.map((lineItem: any, index: number) => {
                const item = lineItem.item
                const quantity = Number(
                  lineItem.serve_locations?.quantity_to_serve || 0,
                )
                const unitPrice = Number(item?.selling_prices?.unit_price || 0)
                const uomLabel =
                  lineItem.selected_uom?.code || lineItem.selected_uom?.name

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 border-b border-neutral-50 p-3 transition-colors last:border-0 hover:bg-neutral-50/80 group"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white flex items-center justify-center">
                      {item?.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.description}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <Package className="h-4 w-4 text-neutral-300" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-xs font-bold text-neutral-900">
                          {item?.description || "Unknown Item"}
                        </span>
                        <span className="text-xs font-black text-neutral-900 shrink-0">
                          {formatCurrency(quantity * unitPrice)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
                          {item?.sku || "NO-SKU"}
                        </span>
                        <div className="h-0.5 w-0.5 rounded-full bg-neutral-300" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                          {quantity} {uomLabel}{" "}
                          <span className="text-neutral-300 mx-0.5">@</span>{" "}
                          {formatCurrency(unitPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/50 p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Total Payable
          </span>
          <span className="text-lg font-black text-neutral-900 tracking-tighter">
            {formatCurrency(Number(order.total_payable))}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}
