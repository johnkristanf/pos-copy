import { InertiaFormProps } from "@inertiajs/react"
import axios from "axios"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/common/dropdown-menu"
import { Label } from "@/components/ui/common/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { Input } from "@/components/ui/inputs/input"
import { SupplierPayload } from "@/types/items-utility.validation"

type LocationType = "City" | "Municipality" | undefined

interface Country {
  name: string
  code: string
  flag: string
}

interface PsgcLocation {
  label: string
  value: string
  code: string
  order?: number
  type?: LocationType
}

interface SupplierLocationRestProps {
  form: InertiaFormProps<SupplierPayload>
  disabled: boolean
}

const PSGC_API_BASE_URL: string = import.meta.env.VITE_PSGC_API || ""
const COUNTRY_API_BASE_URL: string = import.meta.env.VITE_COUNTRY_API || ""

const missingCodes: string[] = [
  "AQ",
  "AX",
  "BQ",
  "BV",
  "HM",
  "MP",
  "NF",
  "PN",
  "SJ",
  "TF",
  "TK",
  "UM",
]

export const SupplierLocationRest: React.FC<SupplierLocationRestProps> = ({
  form,
  disabled,
}) => {
  // State for International Data
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  // State for PSGC Data (Philippines)
  const [regions, setRegions] = useState<PsgcLocation[]>([])
  const [selectedRegion, setSelectedRegion] = useState<PsgcLocation | null>(
    null,
  )

  const [provinces, setProvinces] = useState<PsgcLocation[]>([])
  const [selectedProvince, setSelectedProvince] = useState<PsgcLocation | null>(
    null,
  )

  const [cities, setCities] = useState<PsgcLocation[]>([])
  const [selectedCity, setSelectedCity] = useState<PsgcLocation | null>(null)

  const [barangays, setBarangays] = useState<PsgcLocation[]>([])
  const [selectedBarangay, setSelectedBarangay] = useState<PsgcLocation | null>(
    null,
  )

  // --- MEMOIZED VALUES ---
  const isPhilippines = useMemo(
    () => selectedCountry?.code === "PH",
    [selectedCountry],
  )
  // NCR Region code starts with '13'
  const isNCRRegion = useMemo(
    () => selectedRegion?.code?.startsWith("13"),
    [selectedRegion],
  )

  // --- HELPERS ---

  /**
   * Helper method to define the custom order for Philippine Regions.
   * @param regionName - The full name of the region from the API.
   * @returns A number representing the desired display order.
   */
  const getRegionOrder = (regionName: string): number => {
    const orderMap: { [key: string]: number } = {
      "Region I (Ilocos Region)": 1,
      "Cordillera Administrative Region (CAR)": 2,
      "Region II (Cagayan Valley)": 3,
      "Region III (Central Luzon)": 4,
      "National Capital Region (NCR)": 5,
      "Region IV-A (CALABARZON)": 6,
      "MIMAROPA Region": 7,
      "Region V (Bicol Region)": 8,
      "Region VI (Western Visayas)": 9,
      "Region VII (Central Visayas)": 10,
      "Region VIII (Eastern Visayas)": 11,
      "Region IX (Zamboanga Peninsula)": 12,
      "Region X (Northern Mindanao)": 13,
      "Region XI (Davao Region)": 14,
      "Region XII (SOCCSKSARGEN)": 15,
      "Region XIII (Caraga)": 16,
      "Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)": 17,
    }
    return orderMap[regionName] || 99
  }

  /** Fetches the list of all countries for the initial dropdown. */
  const fetchCountries = useCallback(async () => {
    if (
      !COUNTRY_API_BASE_URL ||
      COUNTRY_API_BASE_URL === "YOUR_COUNTRY_API_BASE_URL"
    ) {
      console.warn("Country API URL not configured")
      return
    }
    try {
      const response = await axios.get(
        `${COUNTRY_API_BASE_URL}/all?fields=name,flags,cca2`,
      )

      const mappedCountries: Country[] = response.data
        .filter((country: { cca2?: string }) => {
          const code = country.cca2?.toUpperCase()
          return code && !missingCodes.includes(code)
        })
        .map(
          (country: {
            name: { common: string }
            cca2: string
            flags: { png: string }
          }) => ({
            name: country.name.common,
            code: country.cca2,
            flag: country.flags?.png || "",
          }),
        )
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

      setCountries(mappedCountries)
      // Set Philippines as default
      const philippines = mappedCountries.find((c) => c.name === "Philippines")
      if (philippines) {
        setSelectedCountry(philippines)
      }
    } catch (error) {
      toast.error(`Failed to fetch countries: ${(error as Error).message}`)
    }
  }, [])

  /** Fetches Philippine Regions. */
  const fetchRegions = useCallback(async () => {
    if (!PSGC_API_BASE_URL || PSGC_API_BASE_URL === "YOUR_PSGC_API_BASE_URL") {
      console.warn("PSGC API URL not configured")
      return
    }
    try {
      const res = await axios.get(`${PSGC_API_BASE_URL}/regions`)
      const allRegions: PsgcLocation[] = res.data.map(
        (region: { name: string; code: string }) => ({
          label: region.name,
          value: region.code,
          code: region.code,
          order: getRegionOrder(region.name),
        }),
      )
      setRegions(allRegions.sort((a, b) => (a.order || 99) - (b.order || 99)))
    } catch (error) {
      toast.error(`Failed to fetch regions: ${(error as Error).message}`)
    }
  }, [])

  /** Fetches Provinces based on Region code (excluding NCR). */
  const fetchProvinces = useCallback(async (regionCode: string) => {
    if (!PSGC_API_BASE_URL) return
    try {
      const res = await axios.get(
        `${PSGC_API_BASE_URL}/regions/${regionCode}/provinces`,
      )
      setProvinces(
        res.data.map((p: { name: string; code: string }) => ({
          label: p.name,
          value: p.code,
          code: p.code,
        })),
      )
    } catch (error) {
      toast.error(`Failed to fetch provinces: ${(error as Error).message}`)
    }
  }, [])

  /** Fetches Cities/Municipalities based on Province code. */
  const fetchCities = useCallback(async (provinceCode: string) => {
    if (!PSGC_API_BASE_URL) return
    try {
      const [muniRes, cityRes] = await Promise.all([
        axios.get(
          `${PSGC_API_BASE_URL}/provinces/${provinceCode}/municipalities`,
        ),
        axios.get(`${PSGC_API_BASE_URL}/provinces/${provinceCode}/cities`),
      ])

      const municipalities: PsgcLocation[] = muniRes.data.map(
        (m: { name: string; code: string }) => ({
          label: m.name,
          value: m.code,
          code: m.code,
          type: "Municipality" as LocationType,
        }),
      )
      const citiesData: PsgcLocation[] = cityRes.data.map(
        (c: { name: string; code: string }) => ({
          label: c.name,
          value: c.code,
          code: c.code,
          type: "City" as LocationType,
        }),
      )

      setCities([...municipalities, ...citiesData])
    } catch (error) {
      toast.error(
        `Failed to fetch cities/municipalities: ${(error as Error).message}`,
      )
    }
  }, [])

  /** Fetches Cities/Municipalities specifically for NCR. */
  const fetchCitiesForNCR = useCallback(async (regionCode: string) => {
    if (!PSGC_API_BASE_URL) return
    try {
      const [citiesRes, municipalitiesRes] = await Promise.all([
        axios.get(`${PSGC_API_BASE_URL}/regions/${regionCode}/cities`),
        axios.get(`${PSGC_API_BASE_URL}/regions/${regionCode}/municipalities`),
      ])

      const cities: PsgcLocation[] = citiesRes.data.map(
        (c: { name: string; code: string }) => ({
          label: c.name,
          value: c.code,
          code: c.code,
          type: "City" as LocationType,
        }),
      )
      const municipalities: PsgcLocation[] = municipalitiesRes.data.map(
        (m: { name: string; code: string }) => ({
          label: m.name,
          value: m.code,
          code: m.code,
          type: "Municipality" as LocationType,
        }),
      )

      setCities([...cities, ...municipalities])
    } catch (error) {
      toast.error(
        `Failed to fetch NCR cities/municipalities: ${(error as Error).message}`,
      )
    }
  }, [])

  /** Fetches Barangays based on City/Municipality. */
  const fetchBarangays = useCallback(async (city: PsgcLocation) => {
    if (!PSGC_API_BASE_URL || !city.type) return
    try {
      const endpoint =
        city.type === "Municipality"
          ? `${PSGC_API_BASE_URL}/municipalities/${city.value}/barangays`
          : `${PSGC_API_BASE_URL}/cities/${city.value}/barangays`

      const res = await axios.get(endpoint)
      setBarangays(
        res.data.map((b: { name: string; code: string }) => ({
          label: b.name,
          value: b.code,
          code: b.code,
        })),
      )
    } catch (error) {
      toast.error(`Failed to fetch barangays: ${(error as Error).message}`)
    }
  }, [])

  // --- FORM DATA UPDATE LOGIC ---

  /** Updates the 'location' and 'address' fields in the parent Inertia form. */
  const updateLocationField = useCallback(
    (
      country: Country,
      region: PsgcLocation | null,
      province: PsgcLocation | null,
      city: PsgcLocation | null,
      barangay: PsgcLocation | null,
    ) => {
      const isPh = country.code === "PH"
      const isNcr = region?.code?.startsWith("13") || false

      // 1. Update 'location' field with structured data for backend processing
      if (isPh) {
        const locationData = {
          country: country.name,
          region: region?.label || "",
          province: (!isNcr && province?.label) || "",
          municipality: city?.label || "",
          barangay: barangay?.label || "",
        }
        form.setData("location", locationData)
      } else {
        // For international, pass country and address
        const locationData = {
          country: country.name,
          region: "",
          province: "",
          municipality: "",
          barangay: "",
        }
        form.setData("location", locationData)
      }

      // 2. Update 'address' field (for display/concatenated preview)
      if (isPh) {
        const addressParts: string[] = []
        if (region) addressParts.push(region.label)
        // Only include province if not NCR
        if (province && !isNcr) addressParts.push(province.label)
        if (city) addressParts.push(city.label)
        if (barangay) addressParts.push(barangay.label)

        // Concatenate the selected hierarchy parts
        form.setData("address", addressParts.join(", "))
      } else {
        // For international, address will be manually entered
        // Don't clear it here as user might be typing
      }
    },
    [form],
  )

  /** Resets all Philippine address hierarchy fields. */
  const resetPsgcFields = useCallback(() => {
    setSelectedRegion(null)
    setSelectedProvince(null)
    setSelectedCity(null)
    setSelectedBarangay(null)
    setProvinces([])
    setCities([])
    setBarangays([])
    form.setData("location", {
      country: selectedCountry?.name || "",
      region: "",
      province: "",
      municipality: "",
      barangay: "",
    })
    form.setData("address", "") // Clear the address display field
  }, [form, selectedCountry])

  // --- HANDLERS (SELECTION) ---

  const handleCountrySelect = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode) || null
    if (!country) return

    setSelectedCountry(country)
    resetPsgcFields()
    updateLocationField(country, null, null, null, null)
  }

  const handleRegionSelect = (region: PsgcLocation) => {
    setSelectedRegion(region)
    setSelectedProvince(null)
    setSelectedCity(null)
    setSelectedBarangay(null)
    setProvinces([])
    setCities([])
    setBarangays([])

    updateLocationField(selectedCountry!, region, null, null, null)

    if (region.code.startsWith("13")) {
      // NCR
      fetchCitiesForNCR(region.code)
    } else {
      fetchProvinces(region.code)
    }
  }

  const handleProvinceSelect = (province: PsgcLocation) => {
    setSelectedProvince(province)
    setSelectedCity(null)
    setSelectedBarangay(null)
    setCities([])
    setBarangays([])

    updateLocationField(selectedCountry!, selectedRegion!, province, null, null)
    fetchCities(province.code)
  }

  const handleCitySelect = (city: PsgcLocation) => {
    setSelectedCity(city)
    setSelectedBarangay(null)
    setBarangays([])

    updateLocationField(
      selectedCountry!,
      selectedRegion!,
      selectedProvince,
      city,
      null,
    )

    // Skip barangay fetch for Manila as per original logic (though a more robust check is advised)
    if (city.label.includes("Manila")) {
      // Skip
    } else {
      fetchBarangays(city)
    }
  }

  const handleBarangaySelect = (barangay: PsgcLocation) => {
    setSelectedBarangay(barangay)
    updateLocationField(
      selectedCountry!,
      selectedRegion!,
      selectedProvince,
      selectedCity,
      barangay,
    )
  }

  // --- LIFECYCLE (Initial Data Load) ---

  useEffect(() => {
    fetchCountries()
    fetchRegions()
  }, [fetchCountries, fetchRegions])

  // --- RENDER HELPERS ---

  // Utility to render the selected country display in the Select component
  const renderCountryValue = () => {
    if (!selectedCountry)
      return <span className="text-muted-foreground">Select a country</span>
    return (
      <div className="flex items-center gap-2">
        <img
          src={selectedCountry.flag}
          alt="Flag"
          className="w-5 h-4 object-cover rounded-sm"
        />
        <span>{selectedCountry.name}</span>
      </div>
    )
  }

  /**
   * Renders a dropdown menu for selecting a geographic location (Region, Province, etc.).
   */
  const renderLocationHierarchy = (
    label: string,
    currentSelection: PsgcLocation | null,
    options: PsgcLocation[],
    onSelect: (value: PsgcLocation) => void,
    isDisabled: boolean,
  ) => {
    // Determine the current selection label or a default placeholder
    const valueLabel = currentSelection
      ? currentSelection.label
      : `Select ${label}`
    const key = label.toLowerCase().replace(/\s/g, "-")

    return (
      <div className="grid gap-1.5 w-full">
        <Label htmlFor={key}>{label}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Input
              id={key}
              value={valueLabel}
              readOnly
              disabled={isDisabled || disabled}
              placeholder={`Select ${label}`}
              className="cursor-pointer text-left"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-64 overflow-y-auto w-72">
            {options.length > 0 ? (
              options.map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onSelect={() => onSelect(item)}
                  className="cursor-pointer"
                >
                  {item.label}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options available
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. Country Selection (Always Visible) */}
      <div className="grid gap-1.5 w-full">
        <Label htmlFor="country">Country</Label>
        <Select
          value={selectedCountry?.code || ""}
          onValueChange={handleCountrySelect}
          disabled={disabled}
        >
          <SelectTrigger className="text-left">
            <SelectValue>{renderCountryValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <img
                    src={country.flag}
                    alt={`${country.name} flag`}
                    className="w-5 h-4 object-cover rounded-sm"
                  />
                  <span>{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Philippine (PH) Address Fields */}
      {isPhilippines ? (
        <div className="grid gap-4">
          {/* Region */}
          {renderLocationHierarchy(
            "Region",
            selectedRegion,
            regions,
            handleRegionSelect,
            false,
          )}

          {/* Province (Hidden/Disabled for NCR) */}
          {(!isNCRRegion || !selectedRegion) &&
            renderLocationHierarchy(
              "Province",
              selectedProvince,
              provinces,
              handleProvinceSelect,
              !selectedRegion || Boolean(isNCRRegion), // Disable if no region or if NCR is selected
            )}

          {/* City / Municipality */}
          {renderLocationHierarchy(
            "City / Municipality",
            selectedCity,
            cities,
            handleCitySelect,
            !selectedRegion || (!selectedProvince && !isNCRRegion),
          )}

          {/* Barangay */}
          {renderLocationHierarchy(
            "Barangay",
            selectedBarangay,
            barangays,
            handleBarangaySelect,
            !selectedCity,
          )}
        </div>
      ) : (
        /* 3. International Address Field */
        <></>
      )}
    </div>
  )
}
