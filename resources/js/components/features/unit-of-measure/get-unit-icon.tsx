import {
  Box,
  Boxes,
  Package,
  Container,
  Droplet,
  Weight,
  Ruler,
  Thermometer,
  Clock,
  Zap,
  Gauge,
  Calculator,
  Circle,
  Square,
  Cylinder,
  Scale,
  Warehouse,
} from "lucide-react"
import { UnitOfMeasure } from "@/types"

export const getUnitIcon = (unitName: string) => {
  const nameLower = unitName.toLowerCase()

  // Weight units
  if (
    nameLower.includes("kg") ||
    nameLower.includes("kilogram") ||
    nameLower.includes("gram") ||
    nameLower.includes("lb") ||
    nameLower.includes("pound") ||
    nameLower.includes("oz") ||
    nameLower.includes("ounce") ||
    nameLower.includes("ton")
  )
    return <Weight className="h-3 w-3" />

  // Length/Distance units
  if (
    nameLower.includes("meter") ||
    nameLower.includes("metre") ||
    nameLower.includes("cm") ||
    nameLower.includes("mm") ||
    nameLower.includes("ft") ||
    nameLower.includes("feet") ||
    nameLower.includes("inch") ||
    nameLower.includes("yard") ||
    nameLower.includes("mile")
  )
    return <Ruler className="h-3 w-3" />

  // Area units
  if (
    nameLower.includes("sqm") ||
    nameLower.includes("sq m") ||
    nameLower.includes("square meter") ||
    nameLower.includes("sqft") ||
    nameLower.includes("sq ft") ||
    nameLower.includes("square feet") ||
    nameLower.includes("hectare") ||
    nameLower.includes("acre")
  )
    return <Ruler className="h-3 w-3" />

  // Volume - Liquid units
  if (
    nameLower.includes("liter") ||
    nameLower.includes("litre") ||
    nameLower.includes("ml") ||
    nameLower.includes("milliliter") ||
    nameLower.includes("gallon") ||
    nameLower.includes("gal") ||
    nameLower.includes("fluid")
  )
    return <Droplet className="h-3 w-3" />

  // Volume - Cubic units
  if (
    nameLower.includes("cubic") ||
    nameLower.includes("cbm") ||
    nameLower.includes("m³") ||
    nameLower.includes("ft³")
  )
    return <Box className="h-3 w-3" />

  // Count/Quantity units
  if (
    nameLower.includes("piece") ||
    nameLower.includes("pcs") ||
    nameLower.includes("unit") ||
    nameLower.includes("ea") ||
    nameLower.includes("each")
  )
    return <Calculator className="h-3 w-3" />

  // Packaging units
  if (
    nameLower.includes("box") ||
    nameLower.includes("carton") ||
    nameLower.includes("case")
  )
    return <Package className="h-3 w-3" />

  if (nameLower.includes("pallet") || nameLower.includes("skid"))
    return <Warehouse className="h-3 w-3" />

  if (
    nameLower.includes("pack") ||
    nameLower.includes("bundle") ||
    nameLower.includes("set")
  )
    return <Boxes className="h-3 w-3" />

  if (nameLower.includes("container") || nameLower.includes("drum"))
    return <Container className="h-3 w-3" />

  if (nameLower.includes("roll") || nameLower.includes("coil"))
    return <Circle className="h-3 w-3" />

  if (nameLower.includes("sheet") || nameLower.includes("panel"))
    return <Square className="h-3 w-3" />

  if (nameLower.includes("tube") || nameLower.includes("pipe"))
    return <Cylinder className="h-3 w-3" />

  // Time units
  if (
    nameLower.includes("hour") ||
    nameLower.includes("hr") ||
    nameLower.includes("minute") ||
    nameLower.includes("day") ||
    nameLower.includes("week") ||
    nameLower.includes("month")
  )
    return <Clock className="h-3 w-3" />

  // Energy/Power units
  if (
    nameLower.includes("watt") ||
    nameLower.includes("kwh") ||
    nameLower.includes("volt") ||
    nameLower.includes("amp")
  )
    return <Zap className="h-3 w-3" />

  // Pressure/Force units
  if (
    nameLower.includes("psi") ||
    nameLower.includes("bar") ||
    nameLower.includes("pascal") ||
    nameLower.includes("pressure")
  )
    return <Gauge className="h-3 w-3" />

  // Temperature units
  if (
    nameLower.includes("celsius") ||
    nameLower.includes("fahrenheit") ||
    nameLower.includes("kelvin") ||
    nameLower.includes("°c") ||
    nameLower.includes("°f")
  )
    return <Thermometer className="h-3 w-3" />

  // Scale/Measurement
  if (nameLower.includes("scale") || nameLower.includes("measure"))
    return <Scale className="h-3 w-3" />

  // Default
  return <Ruler className="h-3 w-3" />
}

export const getUnitIconById = (unitId: number, units: UnitOfMeasure[]) => {
  const unit = units.find((u) => u.id === unitId)
  if (!unit) return <Ruler className="h-3 w-3" />
  return getUnitIcon(unit.name)
}

export const getUnitName = (unitId: number, units: UnitOfMeasure[]): string => {
  const unit = units.find((u) => u.id === unitId)
  return unit?.name ?? "Unknown Unit"
}

export const getUnitAbbreviation = (
  unitId: number,
  units: UnitOfMeasure[],
): string => {
  const unit = units.find((u) => u.id === unitId)
  return unit?.code ?? unit?.name ?? "?"
}
