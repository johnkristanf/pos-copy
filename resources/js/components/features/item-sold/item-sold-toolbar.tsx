import { Download, RefreshCcw } from "lucide-react"
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
import { User } from "@/types"

interface SoldItemToolbarProps {
  onExport?: () => void
  user: User
}

export function SoldItemToolbar({ onExport, user }: SoldItemToolbarProps) {
  const { categories, stockLocation, paymentMethods } = useItemsUtilityContext()
  const { viewWrapper } = useRolePermissionFeatureViewer()

  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
    payment_methods_id: "all",
    search: "",
  })

  const canExport = viewWrapper(
    [],
    ["reports_and_analytics"],
    [],
    ["print"],
    user,
  )

  const hasActiveFilters =
    filters.category_id !== "all" || filters.location_id !== "all"

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
              {categories?.map((category) => (
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
              {stockLocation?.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id) || ""}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Payment Method Filter */}
        <Select
          value={filters.payment_methods_id}
          onValueChange={(val) => setFilter({ payment_methods_id: val })}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel> Transaction </SelectLabel>
              <SelectItem value="all">All Transactions</SelectItem>
              {paymentMethods?.map((pm) => (
                <SelectItem key={pm.id} value={String(pm.id) || ""}>
                  {pm.name}
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
          <Button variant={"outline"} onClick={onExport}>
            <Download className="size-4" /> Export
          </Button>
        )}
      </div>
    </div>
  )
}
