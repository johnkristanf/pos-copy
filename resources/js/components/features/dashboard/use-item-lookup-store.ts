import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

export interface ItemLookupResult {
  id: number
  image_url: string | null
  sku: string
  description: string
  name: string
  brand: string | null
  color: string | null
  size: string | null
  min_quantity: number
  max_quantity: number
  category_id: number
  supplier_id: number
  is_active: boolean
  item_unit_type: string
  total_available_stock: number
  total_committed_stock: number
  store_stock: number
  warehouse_stock: number
  price: number
  locations: string[]
  conversion_units: Array<{
    id: number
    conversion_factor: string
    purchase_uom: {
      id: number
      name: string
      code: string
    }
  }>
  category?: {
    id: number
    code: string
    name: string
  }
  supplier?: {
    id: number
    name: string
  }
  stocks: Array<{
    available_quantity: number
    location: {
      id: number
      name: string
      tag: string
    }
  }>
  selling_prices?: {
    unit_price: string
  } | null
}

interface ItemLookupState {
  query: string
  selectedItem: ItemLookupResult | null
  setQuery: (query: string) => void
  setSelectedItem: (item: ItemLookupResult | null) => void
  clearSelection: () => void
}

export const useItemLookupStore = create<ItemLookupState>()(
  immer((set) => ({
    query: "",
    selectedItem: null,
    setQuery: (query) =>
      set((state) => {
        state.query = query
      }),
    setSelectedItem: (item) =>
      set((state) => {
        state.selectedItem = item
      }),
    clearSelection: () =>
      set((state) => {
        state.query = ""
        state.selectedItem = null
      }),
  })),
)
