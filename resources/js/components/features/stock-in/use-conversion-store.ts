import { create } from "zustand"
import { immer } from "zustand/middleware/immer"

export interface ConversionUnit {
  purchase_uom_id?: number
  base_uom_id?: number
  conversion_factor?: number
  child_item_id?: number
  quantity?: number
}

type UnitType = "set" | "not_set"

interface State {
  units: ConversionUnit[]
}

interface Actions {
  initializeUnits: (units: ConversionUnit[], type: UnitType) => void
  addUnit: (type: UnitType) => void
  removeUnit: (index: number) => void
  updateUnit: (
    index: number,
    field: keyof ConversionUnit,
    value: number,
  ) => void
  reset: () => void
}

const getEmptyUnit = (type: UnitType): ConversionUnit => {
  if (type === "set") {
    return { child_item_id: 0, quantity: 1 }
  }
  return { purchase_uom_id: 0, base_uom_id: 0, conversion_factor: 1 }
}

export const useConversionStore = create<State & Actions>()(
  immer((set) => ({
    units: [],

    initializeUnits: (initialUnits, type) =>
      set((state) => {
        if (!initialUnits || initialUnits.length === 0) {
          state.units = [getEmptyUnit(type)]
        } else {
          state.units = initialUnits
        }
      }),

    addUnit: (type) =>
      set((state) => {
        state.units.push(getEmptyUnit(type))
      }),

    removeUnit: (index) =>
      set((state) => {
        state.units.splice(index, 1)
      }),

    updateUnit: (index, field, value) =>
      set((state) => {
        const unit = state.units[index]
        if (unit) {
          unit[field] = value
        }
      }),

    reset: () =>
      set((state) => {
        state.units = []
      }),
  })),
)
