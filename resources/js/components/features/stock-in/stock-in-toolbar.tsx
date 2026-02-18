import { Download, RefreshCcw, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/common/select"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { Category, Location, User } from "@/types"
import { useFilters } from "@/hooks/ui/use-utility-filter"

interface StockInToolbarProps {
  onStockIn?: () => void
  categories?: Category[]
  locations?: Location[]
  user: User
  onExport?: () => void
}

export function StockInToolbar({
  onStockIn,
  categories = [],
  locations = [],
  user,
  onExport,
}: StockInToolbarProps) {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
  })

  const hasActiveFilters =
    filters.category_id !== "all" || filters.location_id !== "all"

  const canStockIn = viewWrapper([], ["stock_in"], [], ["create"], user)

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        {/* Category Filter */}
        <Select
          value={filters.category_id}
          onValueChange={(val) => setFilter({ category_id: val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.code}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select
          value={filters.location_id}
          onValueChange={(val) => setFilter({ location_id: val })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Location</SelectLabel>
              <SelectItem value="all">All Locations</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.name!}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>

        <Button variant={"outline"} onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        {canStockIn && (
          <Button onClick={onStockIn} variant={"bridge_digital"}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Stock In
          </Button>
        )}
      </div>
    </div>
  )
}
