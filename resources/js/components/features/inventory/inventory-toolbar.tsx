import { Link } from "@inertiajs/react"
import { Download, RefreshCcw, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/common/badge"
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
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRolePermissionFeatureViewer } from "@/hooks/ui/use-role-permission-viewer"
import { useFilters } from "@/hooks/ui/use-utility-filter"
import { Category, Location, User } from "@/types"

interface InventoryToolbarProps {
  categories?: Category[]
  locations?: Location[]
  user: User
  onExport?: () => void
}

export const InventoryToolbar = ({
  categories = [],
  locations = [],
  user,
  onExport,
}: InventoryToolbarProps) => {
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
    search: "",
  })

  const canStockIn = viewWrapper([], ["stock_in"], [], ["create", "read"], user)
  const canStockTransfer = viewWrapper(
    [],
    ["stock_transfer"],
    [],
    ["create", "read"],
    user,
  )
  const canAdjust = viewWrapper(
    ["Inventory Manager"],
    ["inventory"],
    [],
    ["create"],
    user,
  )
  const canExport = viewWrapper([], ["inventory"], [], ["print"], user)

  const handleClearFilters = () => {
    setFilter({ category_id: "all", location_id: "all" })
  }

  const hasActiveFilters =
    filters.category_id !== "all" || filters.location_id !== "all"

  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div className="flex gap-2 items-center">
        {/* Category Filter */}
        <Select
          value={filters.category_id}
          onValueChange={(val) => setFilter({ category_id: val })}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
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
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Location</SelectLabel>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            title="Clear filters"
          >
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}

        <div className="flex gap-2 ml-2">
          {canStockIn && (
            <Badge variant="navigation" className="gap-1.5 font-normal">
              <Link href={PAGE_ROUTES.ITEMS_STOCK_IN_PAGE}>Stock In</Link>
            </Badge>
          )}

          {canStockTransfer && (
            <Badge variant="navigation" className="gap-1.5 font-normal">
              <Link href={PAGE_ROUTES.ITEMS_STOCK_TRANSFER_PAGE}>
                <span>Stock Transfer</span>
              </Link>
            </Badge>
          )}

          {canAdjust && (
            <Badge variant="navigation" className="gap-1.5 font-normal">
              <Link href={PAGE_ROUTES.ITEMS_STOCK_ADJUSTMENT_PAGE}>
                <span>Adjustment</span>
              </Link>
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>

        {canExport && (
          <Button variant={"outline"} onClick={onExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        )}
      </div>
    </div>
  )
}
