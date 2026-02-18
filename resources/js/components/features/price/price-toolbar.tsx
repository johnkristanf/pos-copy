import { Download, RefreshCcw, XCircle } from "lucide-react"
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
import { Category, Location } from "@/types"
import { useFilters } from "@/hooks/ui/use-utility-filter"

interface PriceToolbarProps {
  categories?: Category[]
  locations?: Location[]
  onExport?: () => void
}

export const PriceToolbar = ({
  categories = [],
  locations = [],
  onExport,
}: PriceToolbarProps) => {
  const { filters, setFilter } = useFilters({
    category_id: "all",
    location_id: "all",
  })

  const hasActiveFilters =
    filters.category_id !== "all" || filters.location_id !== "all"

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
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
          <SelectTrigger className="w-[180px]">
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

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setFilter({ category_id: "all", location_id: "all" })
            }
            title="Clear filters"
          >
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>

        <Button variant={"outline"} onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  )
}
