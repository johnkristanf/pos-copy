import {
  Boxes,
  Building2,
  Cable,
  Cpu,
  Drill,
  Droplet,
  Fan,
  Folder,
  Hammer,
  Home,
  Lightbulb,
  Package,
  Paintbrush,
  Plug,
  Ruler,
  Scissors,
  Settings,
  Shield,
  Truck,
  Wrench,
  Zap,
} from "lucide-react"
import { Category } from "@/types"

export const getCategoryIcon = (categoryName: string | undefined) => {
  const nameLower = categoryName?.toLowerCase()

  // Tools & Hardware
  if (nameLower?.includes("hammer")) return <Hammer className="h-3 w-3" />
  if (nameLower?.includes("drill")) return <Drill className="h-3 w-3" />
  if (nameLower?.includes("wrench") || nameLower?.includes("spanner"))
    return <Wrench className="h-3 w-3" />
  if (nameLower?.includes("scissors") || nameLower?.includes("cut"))
    return <Scissors className="h-3 w-3" />
  if (nameLower?.includes("ruler") || nameLower?.includes("measure"))
    return <Ruler className="h-3 w-3" />

  // Paint & Finishing
  if (nameLower?.includes("paint") || nameLower?.includes("finish"))
    return <Paintbrush className="h-3 w-3" />

  // Electrical
  if (nameLower?.includes("electric") || nameLower?.includes("power"))
    return <Zap className="h-3 w-3" />
  if (nameLower?.includes("cable") || nameLower?.includes("wire"))
    return <Cable className="h-3 w-3" />
  if (nameLower?.includes("plug") || nameLower?.includes("socket"))
    return <Plug className="h-3 w-3" />
  if (
    nameLower?.includes("light") ||
    nameLower?.includes("bulb") ||
    nameLower?.includes("lamp")
  )
    return <Lightbulb className="h-3 w-3" />
  if (nameLower?.includes("fan") || nameLower?.includes("ventilat"))
    return <Fan className="h-3 w-3" />

  // Plumbing
  if (
    nameLower?.includes("plumb") ||
    nameLower?.includes("pipe") ||
    nameLower?.includes("water")
  )
    return <Droplet className="h-3 w-3" />

  // Materials & Supplies
  if (
    nameLower?.includes("material") ||
    nameLower?.includes("supply") ||
    nameLower?.includes("supplies")
  )
    return <Package className="h-3 w-3" />
  if (nameLower?.includes("box") || nameLower?.includes("storage"))
    return <Boxes className="h-3 w-3" />

  // Building & Construction
  if (nameLower?.includes("building") || nameLower?.includes("construction"))
    return <Building2 className="h-3 w-3" />
  if (nameLower?.includes("home") || nameLower?.includes("residential"))
    return <Home className="h-3 w-3" />

  // Electronics & Tech
  if (
    nameLower?.includes("electronic") ||
    nameLower?.includes("tech") ||
    nameLower?.includes("digital")
  )
    return <Cpu className="h-3 w-3" />

  // Transport & Logistics
  if (
    nameLower?.includes("transport") ||
    nameLower?.includes("delivery") ||
    nameLower?.includes("shipping")
  )
    return <Truck className="h-3 w-3" />

  // Safety & Protection
  if (
    nameLower?.includes("safety") ||
    nameLower?.includes("protection") ||
    nameLower?.includes("security")
  )
    return <Shield className="h-3 w-3" />

  // Settings & Maintenance
  if (
    nameLower?.includes("maintenance") ||
    nameLower?.includes("service") ||
    nameLower?.includes("repair")
  )
    return <Settings className="h-3 w-3" />

  // Default
  return <Folder className="h-3 w-3" />
}

export const getCategoryIconById = (
  categoryId: number,
  categories: Category[],
) => {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return <Shield className="h-3 w-3" />
  return getCategoryIcon(category.name)
}

export const getCategoryName = (
  categoryId: number,
  categories: Category[],
): string => {
  const category = categories.find((c) => c.id === categoryId)
  return category?.name ?? "Unknown Category"
}
