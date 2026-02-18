import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import {
  PsgcBarangay,
  PsgcCityMunicipality,
  PsgcProvince,
  PsgcRegion,
} from "@/types"

interface LocationState {
  activeRegion: PsgcRegion | null
  provinces: PsgcProvince[]
  cityMunicipalities: PsgcCityMunicipality[]
  barangays: PsgcBarangay[]

  setRegionData: (data: {
    info: PsgcRegion
    provinces: PsgcProvince[]
    citiesMunicipalities: PsgcCityMunicipality[]
    barangays: PsgcBarangay[]
  }) => void
  resetLocationData: () => void
}

export const useLocationStore = create<LocationState>()(
  immer((set) => ({
    activeRegion: null,
    provinces: [],
    cityMunicipalities: [],
    barangays: [],

    setRegionData: (data) =>
      set((state) => {
        state.activeRegion = data.info
        state.provinces = data.provinces
        state.cityMunicipalities = data.citiesMunicipalities
        state.barangays = data.barangays
      }),

    resetLocationData: () =>
      set((state) => {
        state.activeRegion = null
        state.provinces = []
        state.cityMunicipalities = []
        state.barangays = []
      }),
  })),
)
