import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Category, Item, StockLocation, Supplier, UnitOfMeasure } from "@/types"

interface StockInState {
  items: Item[]
  categories: Category[]
  suppliers: Supplier[]
  stockLocations: StockLocation[]
  unitOfMeasures: UnitOfMeasure[]
  isLoading: boolean
}

interface StockInActions {
  setDependencies: (data: {
    items?: Item[]
    categories?: Category[]
    suppliers?: Supplier[]
    stockLocations?: StockLocation[]
    unitOfMeasures?: UnitOfMeasure[]
  }) => void
  reset: () => void
}

export const useStockInStore = create<StockInState & StockInActions>()(
  immer((set) => ({
    items: [],
    categories: [],
    suppliers: [],
    stockLocations: [],
    unitOfMeasures: [],
    isLoading: true,

    setDependencies: (data) =>
      set((state) => {
        if (data.items !== undefined) state.items = data.items
        if (data.categories !== undefined) state.categories = data.categories
        if (data.suppliers !== undefined) state.suppliers = data.suppliers
        if (data.stockLocations !== undefined)
          state.stockLocations = data.stockLocations
        if (data.unitOfMeasures !== undefined)
          state.unitOfMeasures = data.unitOfMeasures
        if (
          state.items.length > 0 &&
          state.categories.length > 0 &&
          state.suppliers.length > 0
        ) {
          state.isLoading = false
        }
      }),

    reset: () =>
      set((state) => {
        state.items = []
        state.categories = []
        state.suppliers = []
        state.stockLocations = []
        state.unitOfMeasures = []
        state.isLoading = true
      }),
  })),
)
