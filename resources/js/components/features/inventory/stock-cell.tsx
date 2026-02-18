import { AlertCircle, Check, Store, Warehouse } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { cn } from "@/lib/cn"
import { InventoryItem } from "@/types"

export const StockCell = ({ item }: { item: InventoryItem }) => {
  const stocks = item.stocks || []
  const conversions = item.conversion_units || []
  const [selectedUomId, setSelectedUomId] = useState<number | null>(null)

  // Sort conversions by available_stocks descending (Grams -> Kilograms -> Box)
  // This matches the requested display order and helps identify the largest unit
  const sortedConversions = useMemo(() => {
    return [...conversions].sort(
      (a, b) =>
        (Number(b.available_stocks) || 0) - (Number(a.available_stocks) || 0),
    )
  }, [conversions])

  // Default to the unit with the smallest quantity (usually the Main/Largest Unit e.g. Box)
  // sortedConversions is Descending (Big Number -> Small Number), so last element is Smallest Quantity (Largest Unit)
  const defaultUomId = useMemo(() => {
    if (sortedConversions.length === 0) return null
    return sortedConversions[sortedConversions.length - 1]?.purchase_uom_id
  }, [sortedConversions])

  const activeUomId = selectedUomId ?? defaultUomId

  const activeUnit = useMemo(() => {
    return conversions.find((c) => c.purchase_uom_id === activeUomId)
  }, [activeUomId, conversions])

  const activeUnitName = activeUnit?.purchase_uom?.name || ""
  const totalAvailableInActiveUnit = Number(activeUnit?.available_stocks || 0)

  // Calculate total raw stock ratio for distribution
  const totalRawStock = useMemo(() => {
    return stocks.reduce((acc, s) => acc + Number(s.available_quantity), 0)
  }, [stocks])

  const getStockForLocation = (tag: string) => {
    const locRaw = stocks
      .filter(
        (s) =>
          s.location?.tag === tag ||
          s.location?.name?.toLowerCase().includes(tag),
      )
      .reduce((acc, s) => acc + Number(s.available_quantity), 0)

    if (totalRawStock === 0) return 0

    // Distribute the active unit's total based on the raw stock ratio
    const ratio = locRaw / totalRawStock
    return totalAvailableInActiveUnit * ratio
  }

  const storeDisplayVal = getStockForLocation("store")
  const warehouseDisplayVal = getStockForLocation("warehouse")

  const formatVal = (val: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  const min = item.min_quantity ?? 0
  const max = item.max_quantity ?? Infinity

  // Determine stock level to check against Min/Max
  // We use the Main Unit (Largest Unit/Smallest Qty) for the Low Stock check
  // as Min/Max are typically defined in terms of the Main Purchasing Unit.
  const mainUnit =
    sortedConversions.length > 0
      ? sortedConversions[sortedConversions.length - 1]
      : null

  // If we have conversions, use the Main Unit stock, otherwise fall back to raw total
  const stockToCheck = mainUnit
    ? Number(mainUnit.available_stocks || 0)
    : totalRawStock

  const isLowStock = stockToCheck <= min
  const isOverStock = max !== Infinity && stockToCheck >= max

  const renderTooltipContent = () => (
    <div className="p-3 border rounded-md bg-background shadow-sm min-w-45">
      <div className="text-xs font-semibold mb-2 border-b pb-1">
        Stock Level Breakdown
      </div>
      <div className="flex flex-col gap-1.5">
        {sortedConversions && sortedConversions.length > 0 ? (
          sortedConversions.map((unit) => {
            const isSelected = activeUomId === unit.purchase_uom_id
            return (
              <div
                key={unit.id}
                className={cn(
                  "flex items-center justify-between gap-4 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors",
                  isSelected && "bg-muted font-medium",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedUomId(unit.purchase_uom_id)
                }}
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3 w-3 text-primary" />}
                  <span
                    className={cn(
                      "text-muted-foreground",
                      isSelected && "text-foreground",
                    )}
                  >
                    {unit.purchase_uom?.name || "Unit"}
                  </span>
                </div>
                <span className="font-mono font-medium">
                  {unit.available_stocks
                    ? Number(unit.available_stocks).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : "0"}
                </span>
              </div>
            )
          })
        ) : (
          <div className="text-xs text-muted-foreground italic">
            No conversion units
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-1">
      {/* Store Stock */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help justify-between">
            <div className="flex gap-2">
              <Store className="h-3 w-3 text-gray-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Store</span>
            </div>
            <span className="text-xs font-medium tabular-nums">
              {formatVal(storeDisplayVal)} {activeUnitName}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="p-0 border-none bg-popover text-popover-foreground shadow-md"
          arrowFillClass="fill-white"
        >
          {renderTooltipContent()}
        </TooltipContent>
      </Tooltip>

      {/* Warehouse Stock */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help justify-between w-45">
            <div className="flex gap-2">
              <Warehouse className="h-3 w-3 text-gray-500 shrink-0" />
              <span className="text-xs text-muted-foreground">Wrhs</span>
            </div>
            <span className="text-xs font-medium tabular-nums">
              {formatVal(warehouseDisplayVal)} {activeUnitName}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="p-0 border-none bg-popover text-popover-foreground shadow-md"
          arrowFillClass="fill-white"
        >
          {renderTooltipContent()}
        </TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-1.5">
        <div
          className={`flex items-center gap-1.5 text-[9px] px-1 py-0.5 rounded-sm border ${
            isLowStock
              ? "bg-red-50 text-red-700 border-red-200"
              : isOverStock
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-muted/30 text-muted-foreground border-transparent"
          }`}
        >
          <span title="Minimum Required">
            min: <span className="font-mono font-medium">{min}</span>
          </span>
          <span className="opacity-30">|</span>
          <span title="Maximum Allowed">
            max:{" "}
            <span className="font-mono font-medium">
              {max === Infinity ? "∞" : max}
            </span>
          </span>
        </div>

        {isLowStock && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-3 w-3 text-red-500 animate-pulse" />
              </TooltipTrigger>
              <TooltipContent
                className="bg-red-500 text-white border-red-600"
                arrowFillClass="fill-destructive"
              >
                <p>Low stock warning</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
