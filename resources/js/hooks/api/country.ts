import { useQuery } from "@tanstack/react-query"
import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { http } from "@/config/http"
import { Country } from "@/types"

interface CountryState {
  selectedCountry: Country | null
  setSelectedCountry: (country: Country | null) => void
  reset: () => void
}

export const useCountryStore = create<CountryState>()(
  immer((set) => ({
    selectedCountry: null,

    setSelectedCountry: (country) =>
      set((state) => {
        state.selectedCountry = country
      }),

    reset: () =>
      set((state) => {
        state.selectedCountry = null
      }),
  })),
)

export const useCountries = () => {
  const query = useQuery<Country[]>({
    queryKey: ["countries-external"],
    queryFn: async () => {
      return await http.get<Country[]>(import.meta.env.VITE_COUNTRY_API, {
        credentials: "omit",
      })
    },
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  })

  return query
}
