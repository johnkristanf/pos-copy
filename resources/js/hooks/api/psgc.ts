import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { http } from "@/config/http"
import {
  PsgcBarangay,
  PsgcCity,
  PsgcCityMunicipality,
  PsgcCombinedResponse,
  PsgcMunicipality,
  PsgcProvince,
  PsgcRegion,
} from "@/types"
import { useLocationStore } from "../ui/use-location"

export const usePsgc = (regionCode?: string) => {
  const setRegionData = useLocationStore((state) => state.setRegionData)
  const resetLocationData = useLocationStore((state) => state.resetLocationData)

  const query = useQuery<PsgcCombinedResponse>({
    queryKey: ["psgc-data", regionCode],
    queryFn: async () => {
      const regionsPromise = http.get<PsgcRegion[]>(
        `${import.meta.env.VITE_PSGC_API}/regions`,
        {
          credentials: "omit",
        },
      )

      if (!regionCode) {
        const regions = await regionsPromise
        return { regions }
      }

      const endpoints = {
        info: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}`,
        provinces: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/provinces`,
        cities: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/cities`,
        municipalities: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/municipalities`,
        citiesMunicipalities: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/cities-municipalities`,
        subMunicipalities: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/sub-municipalities`,
        barangays: `${import.meta.env.VITE_PSGC_API}/regions/${regionCode}/barangays`,
      }

      const [
        regions,
        info,
        provinces,
        cities,
        municipalities,
        citiesMunicipalities,
        subMunicipalities,
        barangays,
      ] = await Promise.all([
        regionsPromise,
        http.get<PsgcRegion>(endpoints.info, { credentials: "omit" }),
        http.get<PsgcProvince[]>(endpoints.provinces, { credentials: "omit" }),
        http.get<PsgcCity[]>(endpoints.cities, { credentials: "omit" }),
        http.get<PsgcMunicipality[]>(endpoints.municipalities, {
          credentials: "omit",
        }),
        http.get<PsgcCityMunicipality[]>(endpoints.citiesMunicipalities, {
          credentials: "omit",
        }),
        http.get<any[]>(endpoints.subMunicipalities, { credentials: "omit" }),
        http.get<PsgcBarangay[]>(endpoints.barangays, { credentials: "omit" }),
      ])

      return {
        regions,
        selectedRegion: {
          info,
          provinces,
          cities,
          municipalities,
          citiesMunicipalities,
          subMunicipalities,
          barangays,
        },
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  useEffect(() => {
    if (query.data?.selectedRegion) {
      setRegionData({
        info: query.data.selectedRegion.info,
        provinces: query.data.selectedRegion.provinces,
        citiesMunicipalities: query.data.selectedRegion.citiesMunicipalities,
        barangays: query.data.selectedRegion.barangays,
      })
    } else if (!regionCode) {
      resetLocationData()
    }
  }, [query.data, regionCode, setRegionData, resetLocationData])

  return query
}
