import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { OrderableItem } from "@/types"
import { useDraftOrderStore } from "./use-draft-order-store"

export type OrderItemError = {
  quantity?: string
  uom?: string
  price?: string
  stock?: string
}

export type PriceType = "unit_price" | "wholesale_price" | "credit_price"

interface CreateOrderState {
  selectedItems: Record<number, OrderableItem>
  quantities: Record<number, number>
  selectedUoms: Record<number, number>
  selectedPriceTypes: Record<number, PriceType>
  errors: Record<number, OrderItemError>
  globalPriceType: PriceType
  actions: {
    toggleItem: (item: OrderableItem, checked: boolean) => void
    toggleAll: (items: OrderableItem[], checked: boolean) => void
    setQuantity: (itemId: number, quantity: number) => void
    setUom: (itemId: number, uomId: number) => void
    setPriceType: (itemId: number, priceType: PriceType) => void
    addItem: (item: OrderableItem, quantity: number, uomId: number) => void
    resetSelection: () => void
    validateAll: () => boolean
    setGlobalPriceType: (priceType: PriceType) => void
  }
}

const getUomPrices = (item: OrderableItem, uomId: number) => {
  const uomPricing = item.stocks_price_per_uom?.find((p) => p.uom_id === uomId)

  if (uomPricing) {
    return {
      id: item.selling_prices?.id || 0,
      item_id: item.id,
      unit_price: String(uomPricing.unit_price),
      wholesale_price: String(uomPricing.wholesale_price),
      credit_price: String(uomPricing.credit_price),
    }
  }

  return item.selling_prices
}

const calculateAvailableStock = (
  item: OrderableItem,
  targetUomId: number,
): number => {
  if (item.stocks_price_per_uom && item.stocks_price_per_uom.length > 0) {
    const stockInfo = item.stocks_price_per_uom.find(
      (s) => s.uom_id === targetUomId,
    )
    if (stockInfo) {
      return stockInfo.available_quantity
    }
  }

  const stockSum = (item.stocks ?? []).reduce(
    (sum, stock) => sum + (stock.available_quantity || 0),
    0,
  )
  const totalStock = stockSum > 0 ? stockSum : (item.total_available_stock ?? 0)

  const conversion = item.conversion_units?.find(
    (c) => c.purchase_uom_id === targetUomId || c.base_uom_id === targetUomId,
  )

  if (conversion && conversion.purchase_uom_id === targetUomId) {
    const factor = Number(conversion.conversion_factor)
    return factor > 0 ? totalStock / factor : totalStock
  }

  return totalStock
}

const validateItemState = (
  item: OrderableItem,
  quantity: number,
  uomId?: number,
): OrderItemError | null => {
  const errors: OrderItemError = {}
  let hasError = false

  const stockSum =
    item.stocks?.reduce((acc, s) => acc + s.available_quantity, 0) ?? 0
  const totalStock = stockSum > 0 ? stockSum : (item.total_available_stock ?? 0)

  if (totalStock <= 0) {
    errors.stock = "Item is out of stock."
    hasError = true
  }

  if (!item.selling_prices?.unit_price) {
    errors.price = "Price is not set for this item."
    hasError = true
  }

  if (!quantity || quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0."
    hasError = true
  } else if (uomId) {
    const availableStock = calculateAvailableStock(item, uomId)

    if (quantity > availableStock) {
      const stockInfo = item.stocks_price_per_uom?.find(
        (s) => s.uom_id === uomId,
      )
      const uomLabel = stockInfo?.uom_code || "units"

      if (availableStock > 0) {
        const maxAllowed = Math.floor(availableStock)
        errors.quantity = `Insufficient stock. Available: ${maxAllowed} ${uomLabel}`
        hasError = true
      }
    }
  }

  if (!uomId) {
    errors.uom = "Unit of measure is required."
    hasError = true
  }

  return hasError ? errors : null
}

export const useCreateOrderStore = create<CreateOrderState>()(
  immer((set, get) => ({
    selectedItems: {},
    quantities: {},
    selectedUoms: {},
    selectedPriceTypes: {},
    errors: {},
    globalPriceType: "unit_price",
    actions: {
      setGlobalPriceType: (priceType) =>
        set((state) => {
          state.globalPriceType = priceType
          Object.keys(state.selectedItems).forEach((itemId) => {
            state.selectedPriceTypes[Number(itemId)] = priceType
          })
        }),
      toggleItem: (item, checked) =>
        set((state) => {
          if (checked) {
            const newItem = { ...item }

            if (!state.quantities[item.id]) {
              state.quantities[item.id] = 1
            }

            if (!state.selectedPriceTypes[item.id]) {
              state.selectedPriceTypes[item.id] = state.globalPriceType
            }

            let activeUom = state.selectedUoms[item.id]
            if (!activeUom) {
              activeUom =
                item.conversion_units?.[0]?.purchase_uom_id ??
                item.conversion_units?.[0]?.base_uom_id ??
                0
              if (activeUom) state.selectedUoms[item.id] = activeUom
            }

            if (activeUom) {
              newItem.selling_prices =
                getUomPrices(newItem, activeUom) || newItem.selling_prices
            }

            state.selectedItems[item.id] = newItem

            const errors = validateItemState(
              newItem,
              state.quantities[item.id],
              state.selectedUoms[item.id],
            )
            if (errors) {
              state.errors[item.id] = errors
            } else {
              delete state.errors[item.id]
            }
          } else {
            delete state.selectedItems[item.id]
            delete state.quantities[item.id]
            delete state.selectedUoms[item.id]
            delete state.selectedPriceTypes[item.id]
            delete state.errors[item.id]
          }
        }),
      toggleAll: (items, checked) =>
        set((state) => {
          if (checked) {
            items.forEach((item) => {
              const newItem = { ...item }

              if (!state.quantities[item.id]) state.quantities[item.id] = 1
              if (!state.selectedPriceTypes[item.id])
                state.selectedPriceTypes[item.id] = state.globalPriceType

              let activeUom = state.selectedUoms[item.id]
              if (!activeUom) {
                activeUom =
                  item.conversion_units?.[0]?.purchase_uom_id ??
                  item.conversion_units?.[0]?.base_uom_id ??
                  0
                if (activeUom) state.selectedUoms[item.id] = activeUom
              }

              if (activeUom) {
                newItem.selling_prices =
                  getUomPrices(newItem, activeUom) || newItem.selling_prices
              }

              state.selectedItems[item.id] = newItem

              const errors = validateItemState(
                newItem,
                state.quantities[item.id],
                state.selectedUoms[item.id],
              )
              if (errors) {
                state.errors[item.id] = errors
              } else {
                delete state.errors[item.id]
              }
            })
          } else {
            items.forEach((item) => {
              delete state.selectedItems[item.id]
              delete state.quantities[item.id]
              delete state.selectedUoms[item.id]
              delete state.selectedPriceTypes[item.id]
              delete state.errors[item.id]
            })
          }
        }),
      setQuantity: (itemId, quantity) =>
        set((state) => {
          if (state.selectedItems[itemId]) {
            state.quantities[itemId] = quantity

            const errors = validateItemState(
              state.selectedItems[itemId],
              quantity,
              state.selectedUoms[itemId],
            )
            if (errors) {
              state.errors[itemId] = errors
            } else {
              delete state.errors[itemId]
            }
          }
        }),
      setUom: (itemId, uomId) =>
        set((state) => {
          const item = state.selectedItems[itemId]
          if (item) {
            state.selectedUoms[itemId] = uomId

            const newPrices = getUomPrices(item, uomId)
            if (newPrices) {
              state.selectedItems[itemId].selling_prices = newPrices
            }

            const currentQuantity = state.quantities[itemId] || 1
            const newUomStock = calculateAvailableStock(item, uomId)

            if (newUomStock > 0 && currentQuantity > newUomStock) {
              state.quantities[itemId] = Math.max(1, Math.floor(newUomStock))
            }

            const errors = validateItemState(
              state.selectedItems[itemId],
              state.quantities[itemId],
              uomId,
            )

            if (errors) {
              state.errors[itemId] = errors
            } else {
              delete state.errors[itemId]
            }
          }
        }),
      setPriceType: (itemId, priceType) =>
        set((state) => {
          if (state.selectedItems[itemId]) {
            state.selectedPriceTypes[itemId] = priceType
          }
        }),
      addItem: (item, quantity, uomId) =>
        set((state) => {
          const newItem = { ...item }

          const newPrices = getUomPrices(newItem, uomId)
          if (newPrices) {
            newItem.selling_prices = newPrices
          }

          state.selectedItems[item.id] = newItem

          const currentQty = state.quantities[item.id] || 0
          const newQty = currentQty + quantity
          state.quantities[item.id] = newQty
          state.selectedUoms[item.id] = uomId
          if (!state.selectedPriceTypes[item.id]) {
            state.selectedPriceTypes[item.id] = state.globalPriceType
          }

          const errors = validateItemState(newItem, newQty, uomId)

          if (errors) {
            state.errors[item.id] = errors
          } else {
            delete state.errors[item.id]
          }
        }),
      resetSelection: () => {
        set((state) => {
          state.selectedItems = {}
          state.quantities = {}
          state.selectedUoms = {}
          state.selectedPriceTypes = {}
          state.errors = {}
        })
        useDraftOrderStore.getState().actions.setCustomer(null)
      },
      validateAll: () => {
        const state = get()
        let hasErrors = false
        const newErrors: Record<number, OrderItemError> = {}

        Object.values(state.selectedItems).forEach((item) => {
          const errors = validateItemState(
            item,
            state.quantities[item.id],
            state.selectedUoms[item.id],
          )

          if (errors) {
            newErrors[item.id] = errors
            hasErrors = true
          }
        })

        set((s) => {
          s.errors = newErrors
        })

        return !hasErrors
      },
    },
  })),
)

export const useCreateOrderActions = () =>
  useCreateOrderStore((state) => state.actions)
export const useSelectedItems = () =>
  useCreateOrderStore((state) => state.selectedItems)
export const useSelectedUoms = () =>
  useCreateOrderStore((state) => state.selectedUoms)
export const useSelectedPriceTypes = () =>
  useCreateOrderStore((state) => state.selectedPriceTypes)
export const useSelectedCount = () =>
  useCreateOrderStore((state) => Object.keys(state.selectedItems).length)
export const useOrderErrors = () => useCreateOrderStore((state) => state.errors)
