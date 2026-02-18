import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  AlertCircle,
  ChevronsUpDown,
  Minus,
  Plus,
  QrCode,
  Ruler,
  ShoppingBag,
  Trash2,
  X,
  Building2,
  Warehouse,
  PackageOpen,
} from "lucide-react"
import { useEffect, useState } from "react"
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
import { InertiaFormProps } from "@inertiajs/react"
import {
  ReturnToSupplierItemPayload,
  ReturnToSupplierPayload,
} from "@/types/return-to-supplier.validation"
import { API_ROUTES } from "@/config/api-routes"
import { PurchasedItem, StockItem, UnifiedItem } from "@/types"

interface SupplierItemsResponse {
  purchased_per_item: PurchasedItem[]
  stocks_per_item: StockItem[]
}

interface ReturnToSupplierItemSelectorProps {
  form: InertiaFormProps<ReturnToSupplierPayload>
  supplierId: number | string | null
  disabled?: boolean
}

export const ReturnToSupplierItemSelector = ({
  form,
  supplierId,
  disabled,
}: ReturnToSupplierItemSelectorProps) => {
  const [openCombobox, setOpenCombobox] = useState(false)
  const [currentItem, setCurrentItem] = useState<UnifiedItem | null>(null)
  const [returnQuantity, setReturnQuantity] = useState(0)

  const {
    data: supplierItems,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["supplier-items", supplierId],
    queryFn: async () => {
      if (!supplierId) return null
      const url = API_ROUTES.FETCH_ITEMS_UNDER_SUPPLIER(supplierId)
      const response = await axios.get<{
        success: boolean
        data: SupplierItemsResponse
      }>(url)
      return response.data.data
    },
    enabled: !!supplierId,
    retry: false,
  })

  const unifiedItems: UnifiedItem[] = []

  if (supplierItems) {
    supplierItems.purchased_per_item.forEach((purchase) => {
      unifiedItems.push({
        id: `unstocked-${purchase.id}`,
        deductionSourceID: purchase.id,
        itemId: purchase.item_id,
        sku: purchase.item.sku,
        description: purchase.item.description,
        brand: purchase.item.brand,
        color: purchase.item.color,
        size: purchase.item.size,
        type: "unstocked",
        purchasedItemId: purchase.item.id,
        purchasedQuantity: purchase.purchased_quantity,
        unitPrice: purchase.unit_price,
        uomCode: purchase.purchase_item_uom.code,
        uomName: purchase.purchase_item_uom.name,
      })
    })

    supplierItems.stocks_per_item.forEach((stock) => {
      unifiedItems.push({
        id: `stocked-${stock.id}`,
        deductionSourceID: stock.id,
        itemId: stock.item_id,
        sku: stock.items.sku,
        description: stock.items.description,
        brand: stock.items.brand,
        color: stock.items.color,
        size: stock.items.size,
        type: "stocked",
        stockId: stock.items.id,
        locationId: stock.location_id,
        locationName: stock.location.name,
        locationTag: stock.location.tag,
        returnableQuantity: stock.returnable_quantity,
      })
    })
  }

  useEffect(() => {
    setCurrentItem(null)
    setReturnQuantity(0)
  }, [supplierId])

  const handleSelectItem = (item: UnifiedItem) => {
    setCurrentItem(item)
    setReturnQuantity(1)
    setOpenCombobox(false)
  }

  const handleQuantityChange = (val: number) => {
    if (!currentItem) return
    const max =
      currentItem.type === "stocked"
        ? currentItem.returnableQuantity || 99999999
        : currentItem.purchasedQuantity || 99999999
    const validVal = Math.max(1, Math.min(val, max))
    setReturnQuantity(validVal)
  }

  const handleAddItemToForm = () => {
    if (!currentItem || returnQuantity <= 0) return

    const sourceId =
      currentItem.type === "stocked"
        ? currentItem.stockId
        : currentItem.purchasedItemId

    if (!sourceId) {
      console.error("Invalid item: missing source ID")
      return
    }

    const newItem: ReturnToSupplierItemPayload = {
      item_id: sourceId,
      quantity: returnQuantity,
      deduction_source_type:
        currentItem.type === "stocked" ? "stock" : "purchase",
      deduction_source_id: currentItem.deductionSourceID,
    }

    const existingItems = form.data.items_to_return || []
    const existsIndex = existingItems.findIndex(
      (i) => i.item_id === newItem.item_id,
    )

    const updatedList: ReturnToSupplierItemPayload[] =
      existsIndex >= 0
        ? existingItems.map((item, idx) =>
            idx === existsIndex
              ? { ...item, quantity: newItem.quantity }
              : item,
          )
        : [...existingItems, newItem]

    form.setData("items_to_return", updatedList)
    setCurrentItem(null)
    setReturnQuantity(0)
  }

  const handleRemoveItem = (index: number) => {
    const existingItems = form.data.items_to_return || []
    const updatedList = existingItems.filter((_, i) => i !== index)
    form.setData("items_to_return", updatedList)
  }

  const getItemDetails = (itemId: number) => {
    const item = unifiedItems.find(
      (i) =>
        (i.type === "stocked" && i.stockId === itemId) ||
        (i.type === "unstocked" && i.purchasedItemId === itemId),
    )
    return item
  }

  const getLocationIcon = (type: string, locationId?: number) => {
    if (type === "unstocked") return PackageOpen
    return locationId === 1 ? Building2 : Warehouse
  }

  if (!supplierId) {
    return (
      <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-muted-foreground">
        Please select a supplier above to view their items.
      </div>
    )
  }

  const addedItems = form.data.items_to_return || []
  const CurrentIcon = currentItem
    ? getLocationIcon(currentItem.type, currentItem.locationId)
    : null

  return (
    <div className="space-y-4">
      {/* Added Items List */}
      {addedItems.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-gray-50/50 p-3">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Items to Return ({addedItems.length})
          </Label>
          <div className="flex flex-col gap-2">
            {addedItems.map((item, idx) => {
              const details = getItemDetails(item.item_id)
              if (!details) return null

              const ItemIcon = getLocationIcon(details.type, details.locationId)

              return (
                <div
                  key={`${item.item_id}-${idx}`}
                  className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-orange-100 text-orange-600">
                      <ItemIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {details.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <kbd className="text-xs text-muted-foreground font-mono">
                          {details.sku}
                        </kbd>
                        {details.type === "stocked" ? (
                          <span className="text-xs text-muted-foreground">
                            • {details.locationName}
                          </span>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not Stocked
                          </Badge>
                        )}
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

      {/* Item Selector */}
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
                {currentItem ? (
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    {currentItem.description}
                    {currentItem.type === "stocked" &&
                      ` (${currentItem.locationName})`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {isLoading ? "Loading items..." : "Search items..."}
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search description or SKU..." />
                <CommandList>
                  <CommandEmpty>
                    {isError ? "Failed to load items." : "No items found."}
                  </CommandEmpty>

                  {/* Unstocked Items */}
                  {unifiedItems.filter((i) => i.type === "unstocked").length >
                    0 && (
                    <CommandGroup heading="For Stock-in">
                      {unifiedItems
                        .filter((i) => i.type === "unstocked")
                        .map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.description} ${item.sku} unstocked`}
                            onSelect={() => handleSelectItem(item)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-1 flex-col gap-1">
                              <div className="flex flex-col">
                                <div className="flex gap-2 items-center">
                                  <div className="font-medium">
                                    {item.description}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="gap-1.5"
                                  >
                                    <PackageOpen className="size-3" />
                                    Fresh
                                  </Badge>
                                </div>
                                <kbd className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                  <QrCode className="size-3.5" />
                                  {item.sku}
                                </kbd>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  Available: {item.purchasedQuantity}{" "}
                                  {item.uomCode}
                                </span>
                                <span>•</span>
                                <span>₱{item.unitPrice}/unit</span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}

                  {/* Stocked Items */}
                  {unifiedItems.filter((i) => i.type === "stocked").length >
                    0 && (
                    <CommandGroup heading="In Stock (By Location)">
                      {unifiedItems
                        .filter((i) => i.type === "stocked")
                        .map((item) => {
                          const LocationIcon = getLocationIcon(
                            item.type,
                            item.locationId,
                          )
                          return (
                            <CommandItem
                              key={item.id}
                              value={`${item.description} ${item.sku} ${item.locationName} stocked`}
                              onSelect={() => handleSelectItem(item)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-1 flex-col gap-1">
                                <div className="flex flex-col">
                                  <div className="flex gap-2 items-center">
                                    <div className="font-medium">
                                      {item.description}
                                    </div>
                                    {item.size && (
                                      <Badge
                                        variant="secondary"
                                        className="gap-1.5 font-normal"
                                      >
                                        <Ruler className="size-3" />
                                        {item.size}
                                      </Badge>
                                    )}
                                  </div>
                                  <kbd className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                    <QrCode className="size-3.5" />
                                    {item.sku}
                                  </kbd>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <LocationIcon className="h-3 w-3" />
                                  <span className="font-medium">
                                    {item.locationName}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Available: {item.returnableQuantity}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          )
                        })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Quantity Configuration */}
          {currentItem && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
              {/* Item Info */}
              <div
                className={`rounded-lg border p-3 ${
                  currentItem.type === "unstocked"
                    ? "border-purple-200 bg-purple-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      currentItem.type === "unstocked"
                        ? "border-purple-200 bg-purple-100 text-purple-600"
                        : "border-blue-200 bg-blue-100 text-blue-600"
                    }`}
                  >
                    {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium ${
                        currentItem.type === "unstocked"
                          ? "text-purple-900"
                          : "text-blue-900"
                      }`}
                    >
                      {currentItem.type === "stocked"
                        ? currentItem.locationName
                        : "Not Yet Stocked (Fresh Purchase)"}
                    </span>
                    <span
                      className={`text-xs ${
                        currentItem.type === "unstocked"
                          ? "text-purple-600"
                          : "text-blue-600"
                      }`}
                    >
                      Available:{" "}
                      {currentItem.type === "stocked"
                        ? currentItem.returnableQuantity
                        : `${currentItem.purchasedQuantity} ${currentItem.uomCode}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <Label className="mb-2 block text-xs text-muted-foreground">
                  Quantity to Return (Max:{" "}
                  {currentItem.type === "stocked"
                    ? currentItem.returnableQuantity
                    : currentItem.purchasedQuantity}
                  )
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
                      handleQuantityChange(parseInt(e.target.value, 10) || 0)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-full rounded-none px-3 text-gray-500 hover:bg-gray-50"
                    onClick={() => handleQuantityChange(returnQuantity + 1)}
                    disabled={
                      returnQuantity >=
                      (currentItem?.type === "stocked"
                        ? (currentItem?.returnableQuantity ?? 0)
                        : (currentItem?.purchasedQuantity ?? 0))
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAddItemToForm}
                  className="flex-1"
                  disabled={returnQuantity === 0}
                >
                  Add Item
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground"
                  onClick={() => {
                    setCurrentItem(null)
                    setReturnQuantity(0)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Info block */}
              <div className="flex items-center gap-2 rounded border border-blue-100 bg-blue-50 p-2 text-xs text-blue-600">
                <AlertCircle className="h-3 w-3" />
                <span>
                  {currentItem.type === "stocked"
                    ? `Stock ID: ${currentItem.stockId} • Location: ${currentItem.locationName}`
                    : `Purchase ID: ${currentItem.purchasedItemId} • Unit Price: ₱${currentItem.unitPrice}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
