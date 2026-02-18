import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Product } from "@/types"

export interface QuotationItem {
  product: Product
  quantity: number
}

interface QuotationSelectionState {
  selectedItems: Record<number, QuotationItem>
  actions: {
    toggleItem: (product: Product, checked: boolean) => void
    toggleAll: (products: Product[], checked: boolean) => void
    updateQuantity: (productId: number, quantity: number) => void
    resetSelection: () => void
  }
}

export const useQuotationStore = create<QuotationSelectionState>()(
  immer((set) => ({
    selectedItems: {},
    actions: {
      toggleItem: (product, checked) =>
        set((state) => {
          if (checked) {
            state.selectedItems[product.id] = { product, quantity: 1 }
          } else {
            delete state.selectedItems[product.id]
          }
        }),
      toggleAll: (products, checked) =>
        set((state) => {
          if (checked) {
            products.forEach((product) => {
              if (!state.selectedItems[product.id]) {
                state.selectedItems[product.id] = { product, quantity: 1 }
              }
            })
          } else {
            products.forEach((product) => {
              delete state.selectedItems[product.id]
            })
          }
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (state.selectedItems[productId] && quantity > 0) {
            state.selectedItems[productId].quantity = quantity
          }
        }),
      resetSelection: () => {
        set((state) => {
          state.selectedItems = {}
        })
      },
    },
  })),
)

export const useProductSelectionActions = () =>
  useQuotationStore((state) => state.actions)

export const useSelectedProducts = () =>
  useQuotationStore((state) => state.selectedItems)

export const useSelectedProductCount = () =>
  useQuotationStore((state) => Object.keys(state.selectedItems).length)
