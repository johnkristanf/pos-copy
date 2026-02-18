import { Download, Plus, RefreshCcw } from "lucide-react"
import { useItemsUtilityContext } from "@/components/contexts/items-utility"
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
import { useFilters } from "@/hooks/ui/use-utility-filter"
import { Category, Item, Supplier, User } from "@/types"

interface ItemToolbarProps {
  createItem?: () => void
  user: User
  onExport?: () => void
  items?: Item[]
  categories?: Category[]
  suppliers?: Supplier[]
}

export function ItemToolbar({
  createItem,
  user,
  onExport,
  items,
  categories,
}: ItemToolbarProps) {
  const { categories: contextCategories, location } = useItemsUtilityContext()
  const { viewWrapper } = useRolePermissionFeatureViewer()
  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
    search: "",
  })

  const canCreate = viewWrapper([], ["item_management"], [], ["create"], user)

  const canExport = viewWrapper(
    ["Inventory Manager"],
    ["item_management"],
    [],
    ["print"],
    user,
  )

  const displayCategories = categories || contextCategories

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
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
              {displayCategories?.map((category) => (
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
              {location?.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id) || ""}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="size-4" /> Refresh
        </Button>

        {canExport && (
          <Button
            variant={"outline"}
            onClick={onExport}
            disabled={!items || items.length === 0}
          >
            <Download className="size-4" /> Export
          </Button>
        )}

        {canCreate && (
          <Button onClick={createItem} variant={"bridge_digital"}>
            <Plus className="size-4" /> Create Item
          </Button>
        )}
      </div>
    </div>
  )
}
