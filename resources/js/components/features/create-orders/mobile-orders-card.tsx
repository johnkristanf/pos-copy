import { Box, PhilippinePeso, Tag } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/common/avatar"
import { Badge } from "@/components/ui/common/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/common/card"
import { Checkbox } from "@/components/ui/common/checkbox"
import { cn } from "@/lib/cn"
import { formatCurrency } from "@/lib/format"
import { OrderableItem, UnitOfMeasure } from "@/types"
import { CreateOrdersActions } from "./create-orders-actions"
import { QuantityCell } from "./quantity-cell"
import { UomSelector } from "./uom-selector"

interface MobileCreateOrderCardProps {
  item: OrderableItem
  isSelected: boolean
  onToggle: (checked: boolean) => void
  unit_of_measures: UnitOfMeasure[]
  setUom: (itemId: number, uomId: number) => void
  selectedUoms: Record<number, number>
}

export const MobileCreateOrdersCard = ({
  item,
  isSelected,
  onToggle,
  unit_of_measures,
  setUom,
  selectedUoms,
}: MobileCreateOrderCardProps) => {
  const price = item.selling_prices?.unit_price
  const totalStock = (item.stocks ?? []).reduce(
    (acc, s) => acc + s.available_quantity,
    0,
  )

  return (
    <div className="group relative mb-4 rounded-xl">
      <div
        className={cn(
          "absolute -inset-0.5 rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-300",
          isSelected && "opacity-100",
        )}
        aria-hidden="true"
      />
      <Card
        className={cn(
          "relative h-full transition-colors",
          isSelected && "border-transparent",
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onToggle(checked as boolean)}
              className="mt-1"
            />
            <Avatar className="h-10 w-10 rounded-md border bg-secondary/10">
              <AvatarImage src={item.image_url ?? ""} alt={item.description} />
              <AvatarFallback className="rounded-md">
                {item.description.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1 mr-2">
              <h3 className="font-semibold text-sm line-clamp-1 break-all">
                {item.description}
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {item.sku}
              </span>
            </div>
          </div>
          <CreateOrdersActions item={item} />
        </CardHeader>

        <CardContent className="grid gap-3 text-sm">
          {isSelected && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/10 rounded-md">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Unit</span>
                <UomSelector
                  item={item}
                  unitOfMeasures={unit_of_measures}
                  selectedValue={selectedUoms[item.id]}
                  onValueChange={(val) => setUom(item.id, val)}
                  isSelected={isSelected}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Quantity</span>
                <QuantityCell item={item} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PhilippinePeso className="h-4 w-4" />
              <span>Unit Price</span>
            </div>
            <div className="font-bold">
              {price ? formatCurrency(price) : "Not Set"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Box className="h-4 w-4" />
              <span>Stock</span>
            </div>
            <Badge variant={totalStock > 0 ? "secondary" : "destructive"}>
              {totalStock} Available
            </Badge>
          </div>

          {(item.brand || item.color || item.size) && (
            <div className="flex items-start gap-2 text-muted-foreground mt-1">
              <Tag className="h-4 w-4 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {item.brand && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {item.brand}
                  </Badge>
                )}
                {item.color && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {item.color}
                  </Badge>
                )}
                {item.size && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1">
                    {item.size}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
