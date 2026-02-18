import { useForm } from "@inertiajs/react"
import { FormEvent, useState } from "react"
import toast from "react-hot-toast"
import { Minus, Plus, Building2, Warehouse, X, Package } from "lucide-react"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { Item, StockLocation } from "@/types"
import {
  StockTransferPayload,
  stockTransferPayloadSchema,
} from "@/types/items-utility.validation"
import { Label } from "@/components/ui/common/label"
import { Button } from "@/components/ui/common/button"
import { Badge } from "@/components/ui/common/badge"
import { ItemSelector } from "../stock-in/stock-in-item-selector"
import { cn } from "@/lib/cn"
import { Input } from "@/components/ui/inputs/input"

interface CreateStockTransferFormProps {
  items: Item[]
  stockLocation: StockLocation[]
}

interface SelectedItemTransfer {
  item_id: number
  item_name: string
  quantity_to_transfer: number
  source_stock_location_id: number
  destination_stock_location_id: number
  source_location_name: string
  destination_location_name: string
  available_stock: number
}

export const CreateStockTransferForm = ({
  items,
  stockLocation,
}: CreateStockTransferFormProps) => {
  const { closeDialog } = useDynamicDialog()
  const [selectedItems, setSelectedItems] = useState<SelectedItemTransfer[]>([])
  const [currentItem, setCurrentItem] = useState<Item | null>(null)
  const [locationStocks, setLocationStocks] = useState<Record<number, number>>(
    {},
  )
  const [transferQuantity, setTransferQuantity] = useState<number>(0)
  const [sourceLocationId, setSourceLocationId] = useState<number>(0)
  const [destinationLocationId, setDestinationLocationId] = useState<number>(0)

  const createStockTransferForm = useForm<StockTransferPayload>({
    selected_items_to_transfer: [],
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
    setTransferQuantity(0)
    setSourceLocationId(0)
    setDestinationLocationId(0)
  }

  const handleQuantityChange = (value: number) => {
    setTransferQuantity(value)
  }

  const handleSourceLocationSelect = (locationId: number) => {
    setSourceLocationId(locationId)
    if (destinationLocationId === locationId) {
      setDestinationLocationId(0)
    }
  }

  const handleDestinationLocationSelect = (locationId: number) => {
    setDestinationLocationId(locationId)
  }

  const increment = () => {
    const maxQuantity = sourceLocationId
      ? locationStocks[sourceLocationId] || 0
      : 0
    if (transferQuantity < maxQuantity) {
      handleQuantityChange(transferQuantity + 1)
    }
  }

  const decrement = () => {
    if (transferQuantity > 0) {
      handleQuantityChange(transferQuantity - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    const numValue = value === "" ? 0 : parseInt(value, 10)
    const maxQuantity = sourceLocationId
      ? locationStocks[sourceLocationId] || 0
      : 0
    handleQuantityChange(Math.min(numValue, maxQuantity))
  }

  const addItemToTransferList = () => {
    if (
      !currentItem ||
      transferQuantity === 0 ||
      sourceLocationId === 0 ||
      destinationLocationId === 0
    ) {
      return
    }

    const sourceLocation = stockLocation.find(
      (loc) => loc.id === sourceLocationId,
    )
    const destinationLocation = stockLocation.find(
      (loc) => loc.id === destinationLocationId,
    )

    const newTransfer: SelectedItemTransfer = {
      item_id: currentItem.id,
      item_name: currentItem.description || `Item ${currentItem.id}`,
      quantity_to_transfer: transferQuantity,
      source_stock_location_id: sourceLocationId,
      destination_stock_location_id: destinationLocationId,
      source_location_name: sourceLocation?.name || "",
      destination_location_name: destinationLocation?.name || "",
      available_stock: locationStocks[sourceLocationId] || 0,
    }

    const updatedItems = [...selectedItems, newTransfer]
    setSelectedItems(updatedItems)

    // Update form data
    createStockTransferForm.setData(
      "selected_items_to_transfer",
      updatedItems.map((item) => ({
        item_id: item.item_id,
        quantity_to_transfer: item.quantity_to_transfer,
        source_stock_location_id: item.source_stock_location_id,
        destination_stock_location_id: item.destination_stock_location_id,
      })),
    )

    // Reset current item state
    setCurrentItem(null)
    setLocationStocks({})
    setTransferQuantity(0)
    setSourceLocationId(0)
    setDestinationLocationId(0)
  }

  const removeItemFromTransferList = (index: number) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index)
    setSelectedItems(updatedItems)

    createStockTransferForm.setData(
      "selected_items_to_transfer",
      updatedItems.map((item) => ({
        item_id: item.item_id,
        quantity_to_transfer: item.quantity_to_transfer,
        source_stock_location_id: item.source_stock_location_id,
        destination_stock_location_id: item.destination_stock_location_id,
      })),
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        stockTransferPayloadSchema,
        createStockTransferForm.data,
        createStockTransferForm,
      )
    ) {
      return
    }

    const createStockTransferPromise = new Promise<void>((resolve, reject) => {
      createStockTransferForm.post(API_ROUTES.CREATE_STOCK_TRANSFER, {
        preserveScroll: true,
        onSuccess: () => {
          createStockTransferForm.reset()
          setSelectedItems([])
          setCurrentItem(null)
          setLocationStocks({})
          setTransferQuantity(0)
          setSourceLocationId(0)
          setDestinationLocationId(0)
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create stock transfer",
            ),
          )
        },
      })
    })

    toast.promise(createStockTransferPromise, {
      loading: (
        <span className="animate-pulse">Creating stock transfer...</span>
      ),
      success: "Stock transfer created successfully!",
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
            Selected Items to Transfer ({selectedItems.length})
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
                      <span>{item.source_location_name}</span>
                      <span>→</span>
                      <span>{item.destination_location_name}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {item.quantity_to_transfer} units
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItemFromTransferList(index)}
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
            : "Select Item to Transfer"}
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
                Source Location
              </Label>
              <div className="space-y-2">
                {stockLocation.map((stockLoc) => {
                  const existingStock = locationStocks[stockLoc.id] || 0
                  const isSelected = sourceLocationId === stockLoc.id
                  const isDisabled =
                    existingStock === 0 || stockLoc.id === destinationLocationId
                  const LocationIcon = getLocationIcon(stockLoc.id)

                  return (
                    <button
                      key={`source-${stockLoc.id}`}
                      type="button"
                      onClick={() =>
                        !isDisabled && handleSourceLocationSelect(stockLoc.id)
                      }
                      disabled={isDisabled}
                      className={cn(
                        "group flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200",
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                          : existingStock > 0
                            ? "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow"
                            : "cursor-not-allowed border-dashed border-gray-200 bg-gray-50/50 opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border",
                            isSelected
                              ? "border-blue-200 bg-blue-100 text-blue-600"
                              : existingStock > 0
                                ? "border-gray-200 bg-gray-100 text-gray-900"
                                : "border-transparent bg-gray-100 text-gray-400",
                          )}
                        >
                          <LocationIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected
                                  ? "text-blue-900"
                                  : existingStock > 0
                                    ? "text-gray-900"
                                    : "text-gray-500",
                              )}
                            >
                              {stockLoc.name}
                            </span>
                            {existingStock > 0 && (
                              <Badge
                                variant={isSelected ? "default" : "secondary"}
                                className="h-5 px-1.5 text-[10px] font-normal"
                              >
                                Available: {existingStock}
                              </Badge>
                            )}
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

            {sourceLocationId > 0 && (
              <>
                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Transfer Quantity
                  </Label>
                  <div className="flex h-11 items-center rounded-md border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={transferQuantity <= 0}
                      onClick={decrement}
                      className="h-full w-11 rounded-none rounded-l-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={transferQuantity}
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
                    Maximum: {locationStocks[sourceLocationId] || 0} units
                  </p>
                </div>

                <div>
                  <Label className="mb-3 block text-sm font-medium">
                    Destination Location
                  </Label>
                  <div className="space-y-2">
                    {stockLocation
                      .filter((loc) => loc.id !== sourceLocationId)
                      .map((stockLoc) => {
                        const existingStock = locationStocks[stockLoc.id] || 0
                        const isSelected = destinationLocationId === stockLoc.id
                        const LocationIcon = getLocationIcon(stockLoc.id)

                        return (
                          <button
                            key={`dest-${stockLoc.id}`}
                            type="button"
                            onClick={() =>
                              handleDestinationLocationSelect(stockLoc.id)
                            }
                            className={cn(
                              "group flex w-full items-center justify-between rounded-lg border p-4 transition-all duration-200",
                              isSelected
                                ? "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200"
                                : "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow",
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg border",
                                  isSelected
                                    ? "border-green-200 bg-green-100 text-green-600"
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
                                      isSelected
                                        ? "text-green-900"
                                        : "text-gray-900",
                                    )}
                                  >
                                    {stockLoc.name}
                                  </span>
                                  {existingStock > 0 && (
                                    <Badge
                                      variant={
                                        isSelected ? "default" : "secondary"
                                      }
                                      className="h-5 px-1.5 text-[10px] font-normal"
                                    >
                                      Current: {existingStock}
                                    </Badge>
                                  )}
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

                {destinationLocationId > 0 && (
                  <Button
                    type="button"
                    onClick={addItemToTransferList}
                    disabled={transferQuantity === 0}
                    className="w-full"
                    variant="secondary"
                  >
                    Add to Transfer List
                  </Button>
                )}
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
          disabled={createStockTransferForm.processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={
            createStockTransferForm.processing || selectedItems.length === 0
          }
          className="flex-1"
        >
          Create Transfer ({selectedItems.length}{" "}
          {selectedItems.length === 1 ? "item" : "items"})
        </Button>
      </div>
    </div>
  )
}
