import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Category, Item, Supplier, UnitOfMeasure } from "@/types"

interface ItemState {
  items: Item[]
  categories: Category[]
  suppliers: Supplier[]
  unitOfMeasures: UnitOfMeasure[]
  isLoading: boolean
}

interface ItemActions {
  setDependencies: (data: {
    items?: Item[]
    categories?: Category[]
    suppliers?: Supplier[]
    unitOfMeasures?: UnitOfMeasure[]
  }) => void
  reset: () => void
}

export const useItemStore = create<ItemState & ItemActions>()(
  immer((set) => ({
    items: [],
    categories: [],
    suppliers: [],
    unitOfMeasures: [],
    isLoading: true,

    setDependencies: (data) =>
      set((state) => {
        if (data.items) state.items = data.items
        if (data.categories) state.categories = data.categories
        if (data.suppliers) state.suppliers = data.suppliers
        if (data.unitOfMeasures) state.unitOfMeasures = data.unitOfMeasures
        state.isLoading = false
      }),

    reset: () =>
      set((state) => {
        state.items = []
        state.categories = []
        state.suppliers = []
        state.unitOfMeasures = []
        state.isLoading = true
      }),
  })),
)
