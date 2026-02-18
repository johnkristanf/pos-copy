import { Store, Warehouse } from "lucide-react"
import { Location } from "@/types"

export const getLocationIcon = (locationType: string) => {
  const typeLower = locationType.toLowerCase()

  if (
    typeLower.includes("store") ||
    typeLower.includes("shop") ||
    typeLower.includes("retail")
  )
    return <Store className="h-3 w-3 text-neutral-700" />

  if (
    typeLower.includes("warehouse") ||
    typeLower.includes("depot") ||
    typeLower.includes("distribution")
  )
    return <Warehouse className="h-3 w-3 text-neutral-700" />

  // Default to warehouse
  return <Warehouse className="h-3 w-3 text-neutral-700" />
}

export const getLocationName = (
  locationId: number,
  locations: Location[],
): string => {
  const location = locations.find((l) => l.id === locationId)
  return location?.name ?? "Unknown Location"
}
