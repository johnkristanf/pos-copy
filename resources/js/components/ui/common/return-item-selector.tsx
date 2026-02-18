import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  AlertCircle,
  ChevronsUpDown,
  Minus,
  Package,
  Plus,
  QrCode,
  Ruler,
  ShoppingBag,
  Trash2,
  X,
  Building2,
  Warehouse,
} from "lucide-react"
import { useEffect, useState } from "react"
import { InertiaFormProps } from "@inertiajs/react"

import { Badge } from "@/components/ui/common/badge"
import { Button } from "@/components/ui/common/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/common/command"
import { Label } from "@/components/ui/common/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/common/pop-over"
import { Input } from "@/components/ui/inputs/input"
import { API_ROUTES } from "@/config/api-routes"
import {
  ReturnFromCustomerItemsPayload,
  ReturnFromCustomerPayload,
} from "@/types/return-from-customer.validation"
import { cn } from "@/lib/cn"
import { OrderedItem, StockLocation } from "@/types"

interface ReturnItemSelectorProps {
  form: InertiaFormProps<ReturnFromCustomerPayload>
  customerId: number | string | null
  stockLocations: StockLocation[]
  disabled?: boolean
}

export const ReturnItemSelector = ({
  form,
  customerId,
  stockLocations,
  disabled,
}: ReturnItemSelectorProps) => {
  const [openCombobox, setOpenCombobox] = useState(false)
  const [currentOrderedItem, setCurrentOrderedItem] =
    useState<OrderedItem | null>(null)
  const [returnQuantity, setReturnQuantity] = useState(0)
  const [selectedLocationId, setSelectedLocationId] = useState<number>(0)

  const {
    data: customerItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer-items", customerId],
    queryFn: async () => {
      if (!customerId) return []
      const url = `${API_ROUTES.FETCH_ITEMS_ORDERED_BY_CUSTOMER(customerId)}`
      const response = await axios.get<{
        success: boolean
        data: OrderedItem[]
      }>(url)
      return response.data.data
    },
    enabled: !!customerId,
    retry: false,
  })

  useEffect(() => {
    setCurrentOrderedItem(null)
    setReturnQuantity(0)
    setSelectedLocationId(0)
  }, [customerId])

  const handleSelectItem = (item: OrderedItem) => {
    setCurrentOrderedItem(item)
    setReturnQuantity(1)
    setSelectedLocationId(0)
    setOpenCombobox(false)
  }

  const handleQuantityChange = (val: number) => {
    if (!currentOrderedItem) return
    const max = currentOrderedItem.quantity_ordered || 9999
    const validVal = Math.max(1, Math.min(val, max))
    setReturnQuantity(validVal)
  }

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocationId(locationId)
  }

  const handleAddItemToForm = () => {
    if (
      !currentOrderedItem ||
      returnQuantity <= 0 ||
      selectedLocationId === 0
    ) {
      return
    }

    const newItem: ReturnFromCustomerItemsPayload = {
      item_id: currentOrderedItem.item_id,
      quantity: returnQuantity,
      stock_location_id: selectedLocationId,
    }

    const existingItems = form.data.returned_items || []
    const existsIndex = existingItems.findIndex(
      (i) =>
        i.item_id === newItem.item_id &&
        i.stock_location_id === newItem.stock_location_id,
    )

    let updatedList: ReturnFromCustomerItemsPayload[]
    if (existsIndex >= 0) {
      updatedList = [...existingItems]
      updatedList[existsIndex].quantity = newItem.quantity
    } else {
      updatedList = [...existingItems, newItem]
    }

    form.setData("returned_items", updatedList)

    setCurrentOrderedItem(null)
    setReturnQuantity(0)
    setSelectedLocationId(0)
  }

  const handleRemoveItem = (index: number) => {
    const existingItems = form.data.returned_items || []
    const updatedList = existingItems.filter((_, i) => i !== index)
    form.setData("returned_items", updatedList)
  }

  const getItemDescription = (itemId: number): string => {
    const item = customerItems.find((i) => i.item_id === itemId)
    return item?.item_name || `Item #${itemId}`
  }

  const getLocationName = (locationId: number): string => {
    const location = stockLocations.find((l) => l.id === locationId)
    return location?.name || `Location #${locationId}`
  }

  const getLocationIcon = (locationId: number) => {
    return locationId === 1 ? Building2 : Warehouse
  }

  if (!customerId) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-muted-foreground">
        Please select a customer above to view their ordered items.
      </div>
    )
  }

  const addedItems = form.data.returned_items || []

  return (
    <div className="space-y-4">
      {addedItems.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-gray-50/50 p-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Items to Return ({addedItems.length})
          </Label>
          <div className="flex flex-col gap-2">
            {addedItems.map((item, idx) => {
              const LocationIcon = getLocationIcon(item.stock_location_id)
              return (
                <div
                  key={`${item.item_id}-${item.stock_location_id}-${idx}`}
                  className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-orange-100 text-orange-600">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getItemDescription(item.item_id)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <LocationIcon className="h-3 w-3" />
                          <span>{getLocationName(item.stock_location_id)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="px-2 py-1">
                      Qty: {item.quantity}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Selector Area */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <Label className="mb-3 block text-sm font-medium">
          {addedItems.length > 0 ? "Add Another Item" : "Select Item to Return"}
        </Label>

        <div className="flex flex-col gap-4">
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                disabled={disabled || isLoading}
                className="w-full justify-between"
              >
                {currentOrderedItem ? (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    {currentOrderedItem.item_name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoading
                      ? "Loading customer items..."
                      : "Search ordered item..."}
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search description or SKU..." />
                <CommandList>
                  <CommandEmpty>
                    {isError
                      ? "Failed to load items."
                      : "No ordered items found for this customer."}
                  </CommandEmpty>
                  <CommandGroup heading="Purchased Items">
                    {customerItems.map((item) => (
                      <CommandItem
                        key={item.item_id}
                        value={item.item_name}
                        onSelect={() => handleSelectItem(item)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-1 flex-col">
                          <div className="flex flex-col">
                            <div className="flex gap-2">
                              <div className="font-medium">
                                {item.item_name}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.size && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1.5 font-normal"
                                  >
                                    <Ruler className="size-3" />
                                    <span>{item.size}</span>
                                  </Badge>
                                )}
                                {item.color && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1.5 font-normal"
                                  >
                                    <div
                                      className="size-3 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="capitalize">
                                      {item.color}
                                    </span>
                                  </Badge>
                                )}
                                {!item.size && !item.color && (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                            <kbd className="text-xs text-muted-foreground font-mono flex flex-row gap-1">
                              <QrCode className="size-3.5" />
                              {item.sku}
                            </kbd>
                          </div>
                          {item.quantity_ordered !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              Ordered Qty: {item.quantity_ordered}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {currentOrderedItem && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Select Return Location
                </Label>
                <div className="space-y-2">
                  {stockLocations.map((stockLoc) => {
                    const isSelected = selectedLocationId === stockLoc.id
                    const LocationIcon = getLocationIcon(stockLoc.id)

                    return (
                      <button
                        key={`location-${stockLoc.id}`}
                        type="button"
                        onClick={() => handleLocationSelect(stockLoc.id)}
                        className={cn(
                          "group flex w-full items-center justify-between rounded-lg border p-3 transition-all duration-200",
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                            : "border-gray-300 bg-white shadow-sm hover:border-gray-400 hover:shadow",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              isSelected
                                ? "border-blue-200 bg-blue-100 text-blue-600"
                                : "border-gray-200 bg-gray-100 text-gray-900",
                            )}
                          >
                            <LocationIcon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected ? "text-blue-900" : "text-gray-900",
                              )}
                            >
                              {stockLoc.name}
                            </span>
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
                    <Label className="mb-2 block text-xs text-muted-foreground">
                      Quantity to Return (Max:{" "}
                      {currentOrderedItem.quantity_ordered || "N/A"})
                    </Label>
                    <div className="flex h-10 items-center rounded-md border border-gray-200 bg-white">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-full rounded-none px-3 text-gray-500 hover:bg-gray-50"
                        onClick={() => handleQuantityChange(returnQuantity - 1)}
                        disabled={returnQuantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        className="h-full border-0 text-center shadow-none focus-visible:ring-0"
                        value={returnQuantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            parseInt(e.target.value, 10) || 0,
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-full rounded-none px-3 text-gray-500 hover:bg-gray-50"
                        onClick={() => handleQuantityChange(returnQuantity + 1)}
                        disabled={
                          !!currentOrderedItem.quantity_ordered &&
                          returnQuantity >= currentOrderedItem.quantity_ordered
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleAddItemToForm}
                      className="flex-1"
                      disabled={
                        returnQuantity === 0 || selectedLocationId === 0
                      }
                    >
                      Add Item
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground"
                      onClick={() => {
                        setCurrentOrderedItem(null)
                        setReturnQuantity(0)
                        setSelectedLocationId(0)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {currentOrderedItem.quantity_ordered !== undefined && (
                    <div className="flex items-center gap-2 rounded border border-blue-100 bg-blue-50 p-2 text-xs text-blue-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Validating against original order record.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
