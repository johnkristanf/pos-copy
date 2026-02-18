// resources/js/components/features/create-orders/create-order-stock-cell.tsx

import { Store, Warehouse } from "lucide-react"
import { useMemo } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { OrderableItem } from "@/types"

interface CreateOrderStockCellProps {
  item: OrderableItem
  selectedUomId?: number
}

export const CreateOrderStockCell = ({
  item,
  selectedUomId,
}: CreateOrderStockCellProps) => {
  const stocks = item.stocks || []
  const conversions = item.conversion_units || []
  // Fixed: Access the pre-calculated stocks per UOM array
  const stocksPricePerUom = item.stocks_price_per_uom || []

  const rawStoreStock = useMemo(
    () =>
      stocks
        .filter(
          (s) =>
            (s.location as any)?.tag === "store" ||
            s.location?.name?.toLowerCase().includes("store"),
        )
        .reduce((acc, s) => acc + (Number(s.available_quantity) || 0), 0),
    [stocks],
  )

  const rawWarehouseStock = useMemo(
    () =>
      stocks
        .filter(
          (s) =>
            (s.location as any)?.tag === "warehouse" ||
            s.location?.name?.toLowerCase().includes("warehouse"),
        )
        .reduce((acc, s) => acc + (Number(s.available_quantity) || 0), 0),
    [stocks],
  )

  const totalRawStock = rawStoreStock + rawWarehouseStock

  const activeUnit = useMemo(() => {
    return conversions.find((c) => c.purchase_uom_id === selectedUomId)
  }, [conversions, selectedUomId])

  const activeStockInfo = useMemo(() => {
    return stocksPricePerUom.find((s) => s.uom_id === selectedUomId)
  }, [stocksPricePerUom, selectedUomId])

  const totalAvailableInActiveUnit = useMemo(() => {
    if (activeStockInfo) {
      return Number(activeStockInfo.available_quantity)
    }

    if (
      activeUnit?.available_stocks &&
      Number(activeUnit.available_stocks) > 0
    ) {
      return Number(activeUnit.available_stocks)
    }

    if (activeUnit) {
      const factor = Number(activeUnit.conversion_factor)
      return factor > 0 ? totalRawStock / factor : totalRawStock
    }

    return totalRawStock
  }, [activeStockInfo, activeUnit, totalRawStock])

  const storeStock =
    totalRawStock > 0
      ? totalAvailableInActiveUnit * (rawStoreStock / totalRawStock)
      : 0

  const warehouseStock =
    totalRawStock > 0
      ? totalAvailableInActiveUnit * (rawWarehouseStock / totalRawStock)
      : 0

  const formatStock = (value: number) => {
    if (value === 0) return "0"
    if (value >= 10000) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    }
    if (Number.isInteger(value)) return value.toString()

    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  const formatFullStock = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(value)
  }

  // Fixed: Use UOM name from activeStockInfo if available, otherwise fallback
  const unitName =
    activeStockInfo?.uom_name || activeUnit?.purchase_uom?.name || ""

  return (
    <div className="flex flex-col w-full min-w-20 gap-1 text-xs">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col gap-1 cursor-help p-1 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Store className="size-3" /> Store
                </span>
                <span className="font-medium">{formatStock(storeStock)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Warehouse className="size-3" /> Whse
                </span>
                <span className="font-medium">
                  {formatStock(warehouseStock)}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs font-medium">
            Exact Combined Total: {formatFullStock(storeStock + warehouseStock)}{" "}
            {unitName}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
