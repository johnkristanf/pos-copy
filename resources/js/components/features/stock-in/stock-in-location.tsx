import { InertiaFormProps } from "@inertiajs/react"
import { Check, Minus, Plus, Store, Warehouse } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import { Input } from "@/components/ui/inputs/input"
import { cn } from "@/lib/cn"
import { StockLocation } from "@/types"

interface StockInLocationProps {
  form: InertiaFormProps<Record<string, any>>
  manualStockIn: boolean
  stockLocation: StockLocation[]
  itemsToBeStockedIn: number
  existingLocationStocks?: Record<number, number>
  selectedUomName?: string
  conversionFactor?: number
}

const createInitialQuantities = (
  stockLocation: StockLocation[],
  definedQuantity: number,
  manualStockIn: boolean,
) => {
  return stockLocation.reduce(
    (acc, dept) => {
      if (manualStockIn) {
        acc[dept.id] = 0
      } else {
        const isDefaultLocation =
          dept.id === 1 || dept.name.toLowerCase().includes("store")
        acc[dept.id] = isDefaultLocation ? definedQuantity : 0
      }
      return acc
    },
    {} as Record<number, number>,
  )
}

export const StockInLocation = ({
  form,
  manualStockIn,
  stockLocation,
  itemsToBeStockedIn,
  existingLocationStocks = {},
  selectedUomName,
  conversionFactor = 1,
}: StockInLocationProps) => {
  const definedQuantity = manualStockIn ? 0 : itemsToBeStockedIn

  const [quantities, setQuantities] = useState(() =>
    createInitialQuantities(stockLocation, definedQuantity, manualStockIn),
  )

  useEffect(() => {
    const stockLocations = Object.entries(quantities).map(([id, quantity]) => ({
      id: Number(id),
      quantity: quantity,
    }))

    form.setData("stock_locations_qty", stockLocations)
  }, [quantities])

  const updateQuantity = (stockLocID: number, newQuantity: number) => {
    setQuantities((prev) => {
      if (manualStockIn) {
        return {
          ...prev,
          [stockLocID]: Math.max(0, newQuantity),
        }
      }

      const constrainedQuantity = Math.max(
        0,
        Math.min(newQuantity, definedQuantity),
      )

      const difference = constrainedQuantity - prev[stockLocID]

      if (difference === 0) return prev

      const newState = {
        ...prev,
        [stockLocID]: constrainedQuantity,
      }

      const amountToRedistribute = -difference

      if (amountToRedistribute !== 0) {
        const otherStockLocIds = Object.keys(prev)
          .map(Number)
          .filter((id) => id !== stockLocID)
          .sort((a, b) => a - b)

        let remaining = amountToRedistribute

        for (const id of otherStockLocIds) {
          if (remaining === 0) break

          const currentQty = newState[id]

          if (remaining > 0) {
            const canAdd = definedQuantity - currentQty
            const toAdd = Math.min(remaining, canAdd)
            newState[id] = currentQty + toAdd
            remaining -= toAdd
          } else {
            const canSubtract = currentQty
            const toSubtract = Math.min(-remaining, canSubtract)
            newState[id] = currentQty - toSubtract
            remaining += toSubtract
          }
        }
      }

      return newState
    })
  }

  const increment = (stockLocID: number) => {
    updateQuantity(stockLocID, quantities[stockLocID] + 1)
  }

  const decrement = (stockLocID: number) => {
    updateQuantity(stockLocID, quantities[stockLocID] - 1)
  }

  const handleInputChange = (
    stockLocID: number,
    e: { target: { value: string } },
  ) => {
    const value = parseInt(e.target.value, 10)
    updateQuantity(stockLocID, Number.isNaN(value) ? 0 : value)
  }

  const getDepartmentIcon = (stockLocName: string) => {
    const name = stockLocName.toLowerCase()
    if (name.includes("store")) return Store
    return Warehouse
  }

  const currentTotal = useMemo(() => {
    return Object.values(quantities).reduce((a, b) => a + b, 0)
  }, [quantities])

  const totalBaseUnits = currentTotal * conversionFactor

  const remainingToAllocate = definedQuantity - currentTotal
  const isFullyAllocated = !manualStockIn && remainingToAllocate === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {manualStockIn
              ? "Record incoming inventory for a specific store or warehouse."
              : "Distribute the purchased inventory across locations."}
          </p>
          {!manualStockIn && (
            <Badge
              variant={isFullyAllocated ? "success" : "warning"}
              className="h-6 px-2 text-xs font-medium"
            >
              {isFullyAllocated ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" /> Fully Allocated
                </span>
              ) : (
                <span>{remainingToAllocate} Remaining</span>
              )}
            </Badge>
          )}
        </div>

        {selectedUomName && conversionFactor > 1 && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            <div className="flex items-center justify-between">
              <span>
                Stocking in as <strong>{selectedUomName}</strong>
              </span>
              <span>
                1 {selectedUomName} = {conversionFactor} Base Units
              </span>
            </div>
            <div className="mt-1 border-t border-blue-100 pt-1 font-medium">
              Total: {currentTotal} {selectedUomName}s ≈ {totalBaseUnits} Base
              Units
            </div>
          </div>
        )}

        {!manualStockIn && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isFullyAllocated ? "bg-emerald-500" : "bg-amber-400",
              )}
              style={{
                width: `${(currentTotal / definedQuantity) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {stockLocation.map((stockLoc) => {
          const DeptIcon = getDepartmentIcon(stockLoc.name)
          const currentQuantity = quantities[stockLoc.id] || 0
          const existingStock = existingLocationStocks[stockLoc.id] || 0
          const isNonZero = currentQuantity > 0

          return (
            <div
              key={stockLoc.id}
              className={cn(
                "group flex items-center justify-between rounded-lg border p-4 transition-all duration-200",
                isNonZero
                  ? "border-gray-300 bg-white shadow-sm"
                  : "border-dashed border-gray-200 bg-gray-50/50",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border",
                    isNonZero
                      ? "border-gray-200 bg-gray-100 text-gray-900"
                      : "border-transparent bg-gray-100 text-gray-400",
                  )}
                >
                  <DeptIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isNonZero ? "text-gray-900" : "text-gray-500",
                      )}
                    >
                      {stockLoc.name}
                    </span>
                    {existingStock > 0 && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 text-[10px] font-normal"
                      >
                        Existing: {existingStock}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Location ID: {stockLoc.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex h-9 items-center rounded-md border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={currentQuantity <= 0}
                    onClick={() => decrement(stockLoc.id)}
                    className="h-full w-9 rounded-none rounded-l-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <div className="relative">
                    {selectedUomName && isNonZero && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 scale-75 whitespace-nowrap text-[10px] text-gray-400">
                        {selectedUomName}
                      </span>
                    )}
                    <Input
                      type="text"
                      value={currentQuantity}
                      onChange={(e) => handleInputChange(stockLoc.id, e)}
                      className="h-full w-14 border-0 bg-transparent p-0 text-center font-mono text-sm text-gray-900 focus-visible:ring-0"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => increment(stockLoc.id)}
                    className="h-full w-9 rounded-none rounded-r-md text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
