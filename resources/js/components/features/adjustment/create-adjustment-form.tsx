import { useForm } from "@inertiajs/react"
import { FormEvent, useState } from "react"
import toast from "react-hot-toast"
import {
  Minus,
  Plus,
  Building2,
  Warehouse,
  X,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { Item, StockLocation } from "@/types"
import { Label } from "@/components/ui/common/label"
import { Button } from "@/components/ui/common/button"
import { Badge } from "@/components/ui/common/badge"
import { ItemSelector } from "../stock-in/stock-in-item-selector"
import { cn } from "@/lib/cn"
import { Input } from "@/components/ui/inputs/input"
import { StockAdjustmentPayload } from "@/types/operation-utility.validation"

interface CreateAdjustmentFormProps {
  items: Item[]
  stockLocation: StockLocation[]
}

interface SelectedItemAdjustment {
  item_id: number
  item_name: string
  quantity: number
  action: "increase" | "deduct"
  location_id: number
  location_name: string
  current_stock: number
}

export const CreateAdjustmentForm = ({
  items,
  stockLocation,
}: CreateAdjustmentFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const [selectedItems, setSelectedItems] = useState<SelectedItemAdjustment[]>(
    [],
  )
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [locationStocks, setLocationStocks] = useState<Record<number, number>>(
    {},
  )
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0)
  const [selectedLocationId, setSelectedLocationId] = useState<number>(0)
  const [adjustmentAction, setAdjustmentAction] = useState<
    "increase" | "deduct"
  >("increase")

  const createStockAdjustmentForm = useForm<StockAdjustmentPayload>({
    adjust_details: [],
  })

  const handleSelectExistingItem = (item: Item) => {
    const getLocationId = (s: any) => s.location_id ?? s.location?.id

    const stocksMap: Record<number, number> = {}
    item.stocks?.forEach((s: any) => {
      const locId = getLocationId(s)
      if (locId) {
        stocksMap[locId] =
          (stocksMap[locId] || 0) + (Number(s.available_quantity) || 0)
      }
    })

    setLocationStocks(stocksMap)
    setCurrentItem(item)
    setAdjustmentQuantity(0)
    setSelectedLocationId(0)
    setAdjustmentAction("increase")
  }

  const handleQuantityChange = (value: number) => {
    setAdjustmentQuantity(value)
  }

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocationId(locationId)
  }

  const handleActionSelect = (action: "increase" | "deduct") => {
    setAdjustmentAction(action)
  }

  const increment = () => {
    handleQuantityChange(adjustmentQuantity + 1)
  }

  const decrement = () => {
    if (adjustmentQuantity > 0) {
      handleQuantityChange(adjustmentQuantity - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    const numValue = value === "" ? 0 : parseInt(value, 10)
    handleQuantityChange(numValue)
  }

  const addItemToAdjustmentList = () => {
    if (!currentItem || adjustmentQuantity === 0 || selectedLocationId === 0) {
      return
    }

    const location = stockLocation.find((loc) => loc.id === selectedLocationId)

    const newAdjustment: SelectedItemAdjustment = {
      item_id: currentItem.id,
      item_name: currentItem.description || `Item ${currentItem.id}`,
      quantity: adjustmentQuantity,
      action: adjustmentAction,
      location_id: selectedLocationId,
      location_name: location?.name || "",
      current_stock: locationStocks[selectedLocationId] || 0,
    }

    const updatedItems = [...selectedItems, newAdjustment]
    setSelectedItems(updatedItems)

    createStockAdjustmentForm.setData(
      "adjust_details",
      updatedItems.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        action: item.action,
        location_id: item.location_id,
      })),
    )

    setCurrentItem(null)
    setLocationStocks({})
    setAdjustmentQuantity(0)
    setSelectedLocationId(0)
    setAdjustmentAction("increase")
  }

  const removeItemFromAdjustmentList = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index)
    setSelectedItems(updatedItems)

    createStockAdjustmentForm.setData(
      "adjust_details",
      updatedItems.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        action: item.action,
        location_id: item.location_id,
      })),
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to adjust")
      return
    }

    const createStockAdjustmentPromise = new Promise<void>(
      (resolve, reject) => {
        createStockAdjustmentForm.post(API_ROUTES.CREATE_STOCK_ADJUSTMENT, {
          preserveScroll: true,
          onSuccess: () => {
            createStockAdjustmentForm.reset()
            setSelectedItems([])
            setCurrentItem(null)
            setLocationStocks({})
            setAdjustmentQuantity(0)
            setSelectedLocationId(0)
            setAdjustmentAction("increase")
            closeDialog()
            resolve()
          },
          onError: (errors) => {
            reject(
              new Error(
                (Object.values(errors)[0] as string) ||
                  "Failed to create stock adjustment",
              ),
            )
          },
        })
      },
    )

    toast.promise(createStockAdjustmentPromise, {
      loading: (
        <span className="animate-pulse">Creating stock adjustment...</span>
      ),
      success: "Stock adjustment created successfully!",
      error: (error) => catchError(error),
    })
  }

  const getLocationIcon = (locationId: number) => {
    return locationId === 1 ? Building2 : Warehouse
  }

  return (
    <div>
      {/* Selected Items List */}
      {selectedItems.length > 0 && (
        <div className="mb-6 space-y-2">
          <Label className="text-sm font-medium">
            Selected Items to Adjust ({selectedItems.length})
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.item_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{item.location_name}</span>
                      <span>•</span>
                      <span>Current: {item.current_stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        item.action === "increase" ? "default" : "destructive"
                      }
                      className="flex items-center gap-1"
                    >
                      {item.action === "increase" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {item.action === "increase" ? "+" : "-"}
                      {item.quantity}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItemFromAdjustmentList(index)}
                  className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 px-1">
        <Label className="whitespace-nowrap">
          {selectedItems.length > 0
            ? "Add Another Item"
            : "Select Item to Adjust"}
        </Label>
        <ItemSelector
          items={items}
          onSelect={handleSelectExistingItem}
          isLoading={false}
          stockDetails={undefined}
        />

        {currentItem && (
          <div className="mt-6 space-y-4">
            <div>
              <Label className="mb-3 block text-sm font-medium">
                Select Location
              </Label>
              <div className="space-y-2">
                {stockLocation.map((stockLoc) => {
                  const existingStock = locationStocks[stockLoc.id] || 0
                  const isSelected = selectedLocationId === stockLoc.id
                  const LocationIcon = getLocationIcon(stockLoc.id)

                  return (
                    <button
                      key={`location-${stockLoc.id}`}
                      type="button"
                      onClick={() => handleLocationSelect(stockLoc.id)}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200",
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                          : "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border",
                            isSelected
                              ? "border-blue-200 bg-blue-100 text-blue-600"
                              : "border-gray-200 bg-gray-100 text-gray-900",
                          )}
                        >
                          <LocationIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected ? "text-blue-900" : "text-gray-900",
                              )}
                            >
                              {stockLoc.name}
                            </span>
                            <Badge
                              variant={isSelected ? "default" : "secondary"}
                              className="h-5 px-1.5 text-[10px] font-normal"
                            >
                              Current: {existingStock}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">
                            Location ID: {stockLoc.id}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedLocationId > 0 && (
              <>
                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Adjustment Action
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleActionSelect("increase")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border p-4 transition-all duration-200",
                        adjustmentAction === "increase"
                          ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200"
                          : "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow",
                      )}
                    >
                      <TrendingUp
                        className={cn(
                          "h-5 w-5",
                          adjustmentAction === "increase"
                            ? "text-green-600"
                            : "text-gray-600",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          adjustmentAction === "increase"
                            ? "text-green-900"
                            : "text-gray-900",
                        )}
                      >
                        Increase
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActionSelect("deduct")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border p-4 transition-all duration-200",
                        adjustmentAction === "deduct"
                          ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-200"
                          : "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow",
                      )}
                    >
                      <TrendingDown
                        className={cn(
                          "h-5 w-5",
                          adjustmentAction === "deduct"
                            ? "text-red-600"
                            : "text-gray-600",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          adjustmentAction === "deduct"
                            ? "text-red-900"
                            : "text-gray-900",
                        )}
                      >
                        Deduct
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Adjustment Quantity
                  </Label>
                  <div className="flex h-11 items-center rounded-md border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={adjustmentQuantity <= 0}
                      onClick={decrement}
                      className="h-full w-11 rounded-none rounded-l-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={adjustmentQuantity}
                        onChange={handleInputChange}
                        className="h-full border-0 bg-transparent p-0 text-center font-mono text-base text-gray-900 focus-visible:ring-0"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={increment}
                      className="h-full w-11 rounded-none rounded-r-md text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Current stock: {locationStocks[selectedLocationId] || 0}{" "}
                    units
                    {adjustmentAction === "increase" &&
                      adjustmentQuantity > 0 && (
                        <span className="text-green-600">
                          {" "}
                          → New:{" "}
                          {(locationStocks[selectedLocationId] || 0) +
                            adjustmentQuantity}
                        </span>
                      )}
                    {adjustmentAction === "deduct" &&
                      adjustmentQuantity > 0 && (
                        <span className="text-red-600">
                          {" "}
                          → New:{" "}
                          {Math.max(
                            0,
                            (locationStocks[selectedLocationId] || 0) -
                              adjustmentQuantity,
                          )}
                        </span>
                      )}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={addItemToAdjustmentList}
                  disabled={adjustmentQuantity === 0}
                  className="w-full"
                  variant="secondary"
                >
                  Add to Adjustment List
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={closeDialog}
          disabled={createStockAdjustmentForm.processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            createStockAdjustmentForm.processing || selectedItems.length === 0
          }
          className="flex-1"
        >
          Create Adjustment ({selectedItems.length}{" "}
          {selectedItems.length === 1 ? "item" : "items"})
        </Button>
      </div>
    </div>
  )
}
