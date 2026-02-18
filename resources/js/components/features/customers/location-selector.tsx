import { Keyboard, MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/common/button"
import { Input } from "@/components/ui/inputs/input"
import { usePsgc } from "@/hooks/api/psgc"
import { useLocationStore } from "@/hooks/ui/use-location"
import { LocationCombobox } from "./location-combo-box"

interface LocationSelectorProps {
  form: any
}

export function LocationSelector({ form }: LocationSelectorProps) {
  const { data, setData, processing, errors } = form
  const [isManual, setIsManual] = useState(false)
  const { data: psgcQueryData, isLoading: isPsgcLoading } = usePsgc(data.region)
  const { provinces, cityMunicipalities, barangays } = useLocationStore()

  const regions = useMemo(
    () =>
      psgcQueryData?.regions.map((r) => ({
        label: `${r.name} - ${r.regionName || ""}`,
        value: r.code,
      })) || [],
    [psgcQueryData?.regions],
  )

  const filteredProvinces = useMemo(
    () => provinces.map((p) => ({ label: p.name, value: p.code })),
    [provinces],
  )

  const filteredCities = useMemo(() => {
    let cities = cityMunicipalities
    if (data.province) {
      const provPrefix = data.province.substring(0, 5)
      cities = cityMunicipalities.filter((c) => c.code.startsWith(provPrefix))
    }
    return cities.map((c) => ({ label: c.name, value: c.code }))
  }, [cityMunicipalities, data.province])

  const filteredBarangays = useMemo(() => {
    if (!data.municipality) return []
    const munPrefix = data.municipality.substring(0, 7)
    return barangays
      .filter((b) => b.code.startsWith(munPrefix))
      .map((b) => ({ label: b.name, value: b.code }))
  }, [barangays, data.municipality])

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setIsManual(!isManual)}
        >
          {isManual ? (
            <>
              <MapPin className="mr-1 h-3 w-3" /> Use Selectors
            </>
          ) : (
            <>
              <Keyboard className="mr-1 h-3 w-3" /> Manual Entry
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isManual ? (
          <>
            <Input
              value={data.region}
              onChange={(e) => setData("region", e.target.value)}
              placeholder="Enter Region"
            />
            <Input
              value={data.province}
              onChange={(e) => setData("province", e.target.value)}
              placeholder="Enter Province"
            />
            <Input
              value={data.municipality}
              onChange={(e) => setData("municipality", e.target.value)}
              placeholder="Enter Municipality"
            />
            <Input
              value={data.barangay}
              onChange={(e) => setData("barangay", e.target.value)}
              placeholder="Enter Barangay"
            />
          </>
        ) : (
          <>
            <LocationCombobox
              label="Region"
              value={data.region}
              options={regions}
              onChange={(v) =>
                setData({
                  ...data,
                  region: v,
                  province: "",
                  municipality: "",
                  barangay: "",
                })
              }
              disabled={processing || isPsgcLoading}
              error={errors.region}
              isLoading={isPsgcLoading}
            />
            <LocationCombobox
              label="Province"
              value={data.province}
              options={filteredProvinces}
              onChange={(v) =>
                setData({
                  ...data,
                  province: v,
                  municipality: "",
                  barangay: "",
                })
              }
              disabled={
                processing || !data.region || filteredProvinces.length === 0
              }
              error={errors.province}
            />
            <LocationCombobox
              label="Municipality / City"
              value={data.municipality}
              options={filteredCities}
              onChange={(v) =>
                setData({ ...data, municipality: v, barangay: "" })
              }
              disabled={
                processing || !data.region || filteredCities.length === 0
              }
              error={errors.municipality}
            />
            <LocationCombobox
              label="Barangay"
              value={data.barangay}
              options={filteredBarangays}
              onChange={(v) => setData("barangay", v)}
              disabled={
                processing ||
                !data.municipality ||
                filteredBarangays.length === 0
              }
              error={errors.barangay}
            />
          </>
        )}
      </div>
    </div>
  )
}
